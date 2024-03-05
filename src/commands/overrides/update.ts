import {
  environmentPrompt,
  EnvironmentPromptResult,
  featurePrompt,
  FeaturePromptResult,
} from "../../ui/prompts";
import { Flags } from "@oclif/core";
import inquirer from "../../ui/autocomplete";
import { variationPrompt } from "../../ui/prompts/variationPrompts";
import { UpdateOverrideDto } from "../../api/schemas";
import { updateOverride } from "../../api/overrides";
import Base from "../base";
import { fetchUserProfile } from "../../api/userProfile";
import { UserOverride } from "../../api/schemas";

export default class UpdateOverride extends Base {
  static hidden = false;
  authRequired = true;
  static description = "Update an Override";
  static examples = [
    "<%= config.bin %> <%= command.id %> --feature feature-key --environment env-key --variation variation-key",
  ];
  static flags = {
    ...Base.flags,
    feature: Flags.string({
      description: "The feature to update an Override for",
    }),
    environment: Flags.string({
      description: "The environment to update an Override for",
    }),
    variation: Flags.string({
      description: "The variation that will be used as the Override",
    }),
  };

  prompts = [];

  public async run(): Promise<void> {
    const { flags } = await this.parse(UpdateOverride);
    const { headless, project } = flags;
    await this.requireProject(project, headless);
    const identity = await fetchUserProfile(this.authToken, this.projectKey);
    if (!identity.dvcUserId) {
      this.writer.showError(
        "You must set your DevCycle Identity before you can update an Override",
      );
      this.writer.infoMessageWithCommand(
        "To set up your SDK Associated User ID, use",
        "dvc identity update",
      );
      return;
    }

    let { feature, environment, variation } = flags;
    let featureName;
    let environmentName;
    let variationName;
    if (headless && (!feature || !environment || !variation)) {
      this.writer.showError(
        "The feature, environment, and variation flag must be set when using headless mode",
      );
      return;
    } else if (headless && feature && environment && variation) {
      const params = await this.populateParametersWithZod(
        UpdateOverrideDto,
        this.prompts,
        {
          feature,
          environment,
          variation,
        },
      );
      const result = await updateOverride(
        this.authToken,
        this.projectKey,
        feature,
        params,
      );
      this.writer.showResults(result);
      return;
    }
    if (!feature) {
      const response = await inquirer.prompt<FeaturePromptResult>(
        [featurePrompt],
        {
          token: this.authToken,
          projectKey: this.projectKey,
        },
      );
      feature = response.feature.key;
      featureName = response.feature.name;
    }
    if (!environment) {
      const responses = await inquirer.prompt<EnvironmentPromptResult>(
        [environmentPrompt],
        {
          token: this.authToken,
          projectKey: this.projectKey,
        },
      );
      environment = responses.environment.key;
      environmentName = responses.environment.name;
    }
    if (!variation) {
      const response = await inquirer.prompt([variationPrompt], {
        token: this.authToken,
        projectKey: this.projectKey,
        featureKey: feature,
      });
      variation = response.variation.key;
      variationName = response.variation.name;
    }

    const params = await this.populateParametersWithZod(
      UpdateOverrideDto,
      this.prompts,
      {
        feature,
        environment,
        variation,
      },
    );

    const result = await updateOverride(
      this.authToken,
      this.projectKey,
      feature,
      params,
    );
    const resultToPrint = {
      featureName: featureName ?? feature,
      variationName: variationName ?? variation,
      environmentName: environmentName ?? environment,
      ...result,
    };

    this.tableOutput.printOverrides<UserOverride>([resultToPrint]);
  }
}
