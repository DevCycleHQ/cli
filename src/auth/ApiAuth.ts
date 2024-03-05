import "reflect-metadata";
import jsYaml from "js-yaml";
import axios from "axios";
import fs from "../utils/fileSystem";
import { plainToClass } from "class-transformer";
import { validateSync } from "class-validator";
import { AuthConfig, storeAccessToken } from "./config";
import { reportValidationErrors } from "../utils/reportValidationErrors";
import { AUTH_URL } from "../api/common";
import { TokenCache } from "./TokenCache";
import { getOrgIdFromToken, getTokenExpiry, shouldRefreshToken } from "./utils";
import { CLI_CLIENT_ID } from "./SSOAuth";
import Writer from "../ui/writer";

type SupportedFlags = {
  "client-id"?: string;
  "client-secret"?: string;
};

export class ApiAuth {
  private tokenCache: TokenCache;
  refreshInProgress = false;

  constructor(
    private authPath: string,
    cacheDir: string,
    private writer: Writer,
  ) {
    this.tokenCache = new TokenCache(cacheDir);
  }

  public async getToken(
    flags: SupportedFlags,
    orgId?: string,
  ): Promise<string> {
    const clientId =
      flags["client-id"] ||
      process.env.DEVCYCLE_CLIENT_ID ||
      process.env.DVC_CLIENT_ID;
    const clientSecret =
      flags["client-secret"] ||
      process.env.DEVCYCLE_CLIENT_SECRET ||
      process.env.DVC_CLIENT_SECRET;

    if (clientId && clientSecret) {
      return this.fetchClientToken(clientId, clientSecret);
    }

    if (this.authPath && fs.existsSync(this.authPath)) {
      return this.getTokenFromAuthFile(orgId);
    }

    return "";
  }

  public getPersonalToken(): string {
    if (this.authPath && fs.existsSync(this.authPath)) {
      return this.getPersonalTokenFromAuthFile();
    }

    return "";
  }

  private loadAuthFile(): AuthConfig {
    const rawConfig = jsYaml.load(fs.readFileSync(this.authPath));
    const config = plainToClass(AuthConfig, rawConfig);
    const errors = validateSync(config);
    reportValidationErrors(errors);
    return config;
  }

  private async getTokenFromAuthFile(orgId?: string): Promise<string> {
    const config = this.loadAuthFile();

    if (config.sso) {
      let { accessToken, refreshToken } = config.sso;

      if (orgId) {
        if (config.sso.orgs && config.sso.orgs[orgId]) {
          ({ accessToken, refreshToken } = config.sso.orgs[orgId]);
        } else if (orgId !== getOrgIdFromToken(accessToken)) {
          return "";
        }
      }

      if (
        accessToken &&
        refreshToken &&
        !this.refreshInProgress &&
        shouldRefreshToken(accessToken)
      ) {
        return this.refreshClientToken(refreshToken);
      }

      return accessToken || "";
    } else if (config.clientCredentials) {
      const { client_id, client_secret } = config.clientCredentials;
      return this.fetchClientToken(client_id, client_secret);
    }

    return "";
  }

  private getPersonalTokenFromAuthFile(): string {
    const config = this.loadAuthFile();

    if (config.sso?.personalAccessToken) {
      const { personalAccessToken } = config.sso;

      const tokenExpiry = getTokenExpiry(personalAccessToken);
      if (tokenExpiry && tokenExpiry > Date.now()) {
        return personalAccessToken;
      }
    }

    return "";
  }

  private async fetchClientToken(
    client_id: string,
    client_secret: string,
  ): Promise<string> {
    const cachedToken = this.tokenCache.get(client_id, client_secret);
    if (cachedToken) {
      return cachedToken;
    }

    const url = new URL("/oauth/token", AUTH_URL);

    try {
      const response = await axios.post(url.href, {
        grant_type: "client_credentials",
        client_id,
        client_secret,
        audience: "https://api.devcycle.com/",
      });

      const accessToken = response.data.access_token;
      this.tokenCache.set(client_id, client_secret, accessToken);
      return accessToken;
    } catch (e) {
      throw new Error(
        "Failed to authenticate with the DevCycle API. Check your credentials.",
      );
    }
  }

  private async refreshClientToken(refresh_token: string): Promise<string> {
    this.refreshInProgress = true;
    const url = new URL("/oauth/token", AUTH_URL);

    try {
      const response = await axios.post(url.href, {
        client_id: CLI_CLIENT_ID,
        grant_type: "refresh_token",
        refresh_token,
        audience: "https://api.devcycle.com/",
      });

      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;
      storeAccessToken({ accessToken, refreshToken }, this.authPath);
      return accessToken;
    } catch (e) {
      let msg = "Failed to refresh DevCycle API token.";
      if (e instanceof Error) {
        msg += ` ${e.message}`;
      }
      this.writer.warningMessage(msg);
      return "";
    } finally {
      this.refreshInProgress = false;
    }
  }
}
