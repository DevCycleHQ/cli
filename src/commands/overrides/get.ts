import { Flags, ux } from "@oclif/core";
import inquirer from "../../ui/autocomplete";
import {
  environmentPrompt,
  EnvironmentPromptResult,
  featurePrompt,
  FeaturePromptResult,
} from "../../ui/prompts";
import Base from "../base";
import { fetchFeatureOverridesForUser } from "../../api/overrides";
import { fetchEnvironmentByKey } from "../../api/environments";
import { fetchVariationByKey } from "../../api/variations";
import { UserOverride } from "../../api/schemas";
import { fetchUserProfile } from "../../api/userProfile";

export default class DetailedOverrides extends Base {
  static hidden = false;
  authRequired = true;
  static description =
    "View the Overrides associated with your DevCycle Identity in your current project.";
  prompts = [featurePrompt, environmentPrompt];
  static args = {};
  static flags = {
    feature: Flags.string({
      name: "feature",
      description: "The key or id of the Feature to get Overrides for",
    }),
    environment: Flags.string({
      name: "environment",
      description: "The key or id of the Environment to get Overrides for",
    }),
    ...Base.flags,
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(DetailedOverrides);
    const { headless, project } = flags;
    let { feature: featureKey, environment: environmentKey } = flags;
    let feature;
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

    if (headless && (!featureKey || !environmentKey)) {
      this.writer.showError("Feature and Environment arguments are required");
      return;
    }

    if (!featureKey) {
      const featurePromptResult = await inquirer.prompt<FeaturePromptResult>(
        [featurePrompt],
        {
          token: this.authToken,
          projectKey: this.projectKey,
        },
      );
      feature = featurePromptResult.feature;
      featureKey = feature.key;
    }

    if (!environmentKey) {
      const { environment: environmentPromptResult } =
        await inquirer.prompt<EnvironmentPromptResult>([environmentPrompt], {
          token: this.authToken,
          projectKey: this.projectKey,
        });
      environmentKey = environmentPromptResult.key;
    }

    const overrides = await fetchFeatureOverridesForUser(
      this.authToken,
      this.projectKey,
      featureKey,
      environmentKey,
    );
    const environment = await fetchEnvironmentByKey(
      this.authToken,
      this.projectKey,
      environmentKey,
    );
    const override = overrides.overrides.find(
      (override) => override._environment === environment._id,
    );

    if (!override) {
      if (headless) {
        this.writer.showResults({
          environment: environment.key,
          variation: null,
        });
        return;
      }
      this.writer.showRawResults(
        `Override for feature: ${featureKey} on environment: ${environment.key} is variation: <not-set>`,
      );
      this.writer.infoMessageWithCommand(
        "To set an override, use:",
        "dvc overrides update",
      );
      return;
    }

    const variation = await fetchVariationByKey(
      this.authToken,
      this.projectKey,
      featureKey,
      override._variation,
    );

    if (headless) {
      this.writer.showResults({
        environment: environment.key,
        variation: variation.key,
      });
      return;
    }

    this.tableOutput.printOverrides<UserOverride>([
      {
        _environment: environment._id ?? override._environment,
        environmentName: environment.name ?? environmentKey,
        _feature: feature?._id ?? featureKey,
        featureName: feature?.name ?? featureKey,
        _variation: variation._id ?? override._variation,
        variationName: variation.name ?? variation.key,
      },
    ]);
  }
}
