import { Flags } from "@oclif/core";
import inquirer from "inquirer";
import Base from "../base";

const ALIAS_DESCRIPTION = "The alias used in the code";
const VARIABLE_DESCRIPTION = "The DevCycle variable key";

export default class AddAlias extends Base {
  static hidden = false;
  static description = "Add a variable alias to the repo configuration";
  static flags = {
    ...Base.flags,
    alias: Flags.string({
      description: ALIAS_DESCRIPTION,
    }),
    variable: Flags.string({
      description: VARIABLE_DESCRIPTION,
    }),
  };
  static examples = [
    "<%= config.bin %> <%= command.id %>",
    "<%= config.bin %> <%= command.id %> --alias=VARIABLE_ALIAS --variable=variable-key",
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(AddAlias);
    const prompts = [
      {
        name: "alias",
        message: ALIAS_DESCRIPTION,
        type: "input",
      },
      {
        name: "variable",
        message: VARIABLE_DESCRIPTION,
        type: "input",
      },
    ];

    const answers = await inquirer.prompt(prompts, {
      token: this.authToken,
      projectKey: this.projectKey,
      alias: flags.alias,
      variable: flags.variable,
    });

    const aliases: Record<string, string> =
      this.repoConfig?.codeInsights?.variableAliases || {};
    if (aliases[answers.alias] === answers.variable) {
      throw new Error(
        `The alias ${answers.alias} already refers to the variable ${answers.variable}`,
      );
    } else if (aliases[answers.alias]) {
      const { shouldOverwrite } = await inquirer.prompt([
        {
          name: "shouldOverwrite",
          message: `Do you want to overwrite the alias ${answers.alias} ?`,
          type: "confirm",
        },
      ]);

      if (!shouldOverwrite) {
        throw new Error("Aborted overwrite");
      }
    }

    aliases[answers.alias] = answers.variable;
    await this.updateRepoConfig({
      codeInsights: {
        ...this.repoConfig?.codeInsights,
        variableAliases: aliases,
      },
    });
  }
}
