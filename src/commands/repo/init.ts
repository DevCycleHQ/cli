import "reflect-metadata";

import AuthCommand from "../authCommand";

export default class InitRepo extends AuthCommand {
  static hidden = false;
  static description =
    "Create the repo configuration file. This will open a browser window.";
  static examples = [];
  userAuthRequired = true;

  public async run(): Promise<void> {
    if (this.repoConfig) {
      throw new Error(
        `Repo configuration already exists at ${this.repoConfigPath}`,
      );
    }

    this.repoConfig = await this.updateRepoConfig({});

    await this.setOrganizationAndProject();
  }
}
