import { Flags } from "@oclif/core";
import inquirer from "../../ui/autocomplete";
import {
  fetchEnvironments,
  fetchEnvironmentByKey,
} from "../../api/environments";
import { EnvironmentPromptResult, environmentPrompt } from "../../ui/prompts";
import Base from "../base";
import { batchRequests } from "../../utils/batchRequests";

export default class DetailedEnvironments extends Base {
  static hidden = false;
  static description = "Retrieve Environments from the management API";
  static examples = [
    "<%= config.bin %> <%= command.id %>",
    "<%= config.bin %> <%= command.id %> --keys=environment-one,environment-two",
  ];
  static flags = {
    ...Base.flags,
    keys: Flags.string({
      description:
        "Comma-separated list of environment keys to fetch details for",
    }),
  };
  authRequired = true;

  public async run(): Promise<void> {
    const { flags } = await this.parse(DetailedEnvironments);
    const keys = flags["keys"]?.split(",");
    const { headless, project } = flags;
    await this.requireProject(project, headless);

    if (keys) {
      const environments = await batchRequests(keys, (key) =>
        fetchEnvironmentByKey(this.authToken, this.projectKey, key),
      );
      this.writer.showResults(environments);
      return;
    }

    // show all environments if no keys flag provided in headless mode
    if (flags.headless) {
      const environments = await fetchEnvironments(
        this.authToken,
        this.projectKey,
      );
      this.writer.showResults(environments);
      return;
    }

    // prompt for key in interactive mode
    const responses = await inquirer.prompt<EnvironmentPromptResult>(
      [environmentPrompt],
      {
        token: this.authToken,
        projectKey: this.projectKey,
      },
    );
    this.writer.showResults(responses.environment);
  }
}
