import { errorMap } from "../../../api/apiClient";
import {
  CreateVariationDto,
  CreateVariationParams,
  Variable,
  Variation,
} from "../../../api/schemas";
import inquirer from "../../autocomplete";
import Writer from "../../writer";
import {
  getVariationVariablesPrompts,
  staticCreateVariationPrompts,
} from "../variationPrompts";
import { ListOption, ListOptionsPrompt } from "./listOptionsPrompt";

export class VariationListOptions extends ListOptionsPrompt<CreateVariationParams> {
  itemType = "Variation";
  messagePrompt = "Manage your Variations";

  featureVariables: Variable[] = [];

  constructor(
    list: CreateVariationParams[],
    existingVariables: Variable[],
    writer: Writer,
  ) {
    super(list, writer);
    this.featureVariables = existingVariables || [];
  }

  getVariationListPrompt = () => {
    return {
      name: "variations",
      value: "variations",
      message: "Manage variations",
      type: "listOptions",
      previousReponseFields: ["variables"], // if variables were just created / updated, use the new variables
      listOptionsPrompt: (previousResponses?: Record<string, any>) => {
        const newVariables = previousResponses?.variables;
        if (newVariables) {
          this.featureVariables = newVariables;
        }
        return this.prompt();
      },
    };
  };

  async promptAddItem() {
    const variation = await inquirer.prompt(staticCreateVariationPrompts);
    variation.variables = await inquirer.prompt(
      getVariationVariablesPrompts(this.featureVariables),
    );

    return {
      name: variation.name,
      value: { item: variation },
    };
  }

  async promptEditItem(list: ListOption<CreateVariationParams>[]) {
    if (list.length === 0) {
      this.writer.warningMessage("No variations to edit");
      return;
    }
    const { variationListItem } = await inquirer.prompt([
      {
        name: "variationListItem",
        message: "Which variation would you like to edit?",
        type: "list",
        choices: list,
      },
    ]);
    const index = list.findIndex(
      (listItem) => listItem.value.item.key === variationListItem.item.key,
    );

    // Have a default for each of the prompts that correspond to the previous value of the variable
    const filledOutPrompts = staticCreateVariationPrompts.map((prompt) => ({
      ...prompt,
      default: variationListItem.item[prompt.name],
    }));

    const editedVariation = await inquirer.prompt(filledOutPrompts);
    editedVariation.variables = await inquirer.prompt(
      getVariationVariablesPrompts(
        this.featureVariables,
        variationListItem.item.variables,
      ),
    );

    CreateVariationDto.parse(editedVariation, { errorMap });
    if (index >= 0) {
      list[index] = {
        name: editedVariation.name || editedVariation.key,
        value: { item: editedVariation },
      };
    }
  }

  transformToListOptions(
    list: CreateVariationParams[],
  ): ListOption<CreateVariationParams>[] {
    return list.map((createVariation) => ({
      name: createVariation.name,
      value: { item: createVariation },
    }));
  }
}
