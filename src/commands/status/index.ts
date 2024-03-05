import chalk from "chalk";
import Base from "../base";

type StatusInfo = {
  version: string;
  repoConfigPath: string;
  repoConfigExists: boolean;
  userConfigPath: string;
  userConfigExists: boolean;
  authConfigPath: string;
  hasAccessToken: boolean;
  organization?: string;
  project?: string;
  a0UserId?: string;
};

export default class ShowStatus extends Base {
  static hidden = false;
  static description =
    "Print CLI version information, configuration file locations and auth status.";

  async run(): Promise<void> {
    const { flags } = await this.parse(ShowStatus);
    if (flags.headless) {
      return this.runHeadless();
    }
    if (this.hasToken()) {
      this.writer.showTogglebot();
    } else {
      this.writer.showTogglebotSleep();
    }

    this.writer.statusMessage(`Devcycle CLI Version ${this.config.version}`);

    this.writer.statusMessage(`Repo config path ${this.repoConfigPath}`);
    if (this.repoConfig) {
      this.writer.successMessage("Repo config loaded");
    } else {
      this.writer.failureMessage("No repo config loaded.");
    }

    this.writer.statusMessage(`User config path ${this.configPath}`);
    if (this.userConfig) {
      this.writer.successMessage("User config loaded");
    } else {
      this.writer.failureMessage("No user config loaded.");
    }

    this.writer.statusMessage(`Auth config path ${this.authPath}`);

    if (this.hasToken()) {
      if (this.organization) {
        this.writer.successMessage("Logged into DevCycle with:");
        this.writer.showRawResults(
          chalk.green(`\tOrganization: ${this.organization.display_name}`),
        );
        if (this.projectKey) {
          this.writer.showRawResults(
            chalk.green(`\tProject Key: ${this.projectKey}`),
          );
        }
      } else {
        this.writer.successMessage("Currently logged in to DevCycle");
      }
    } else {
      this.writer.failureMessage("Currently not logged in to DevCycle");
    }
  }

  async runHeadless(): Promise<void> {
    const result: StatusInfo = {
      version: this.config.version,
      repoConfigPath: this.repoConfigPath,
      repoConfigExists: !!this.repoConfig,
      userConfigPath: this.configPath,
      userConfigExists: !!this.userConfig,
      authConfigPath: this.authPath,
      hasAccessToken: this.hasToken(),
      organization: this.organization?.display_name,
      project: this.projectKey,
    };
    if (this.hasToken()) {
      const tokenJson = JSON.parse(
        Buffer.from(this.authToken.split(".")[1], "base64").toString(),
      );
      result.a0UserId = tokenJson["sub"];
    }
    this.writer.showResults(result);
  }
}
