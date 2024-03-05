import Base from "../base";
import fs from "fs";
import { fetchAllVariables } from "../../api/variables";
import { Flags } from "@oclif/core";
import { Variable } from "../../api/schemas";
import {
  OrganizationMember,
  fetchOrganizationMembers,
} from "../../api/members";

const reactImports = (oldRepos: boolean) => {
  const jsRepo = oldRepos
    ? "@devcycle/devcycle-js-sdk"
    : "@devcycle/js-client-sdk";
  const reactRepo = oldRepos
    ? "@devcycle/devcycle-react-sdk"
    : "@devcycle/react-client-sdk";
  return `import { DVCVariable, DVCVariableValue } from '${jsRepo}'
import {
    useVariable as originalUseVariable,
    useVariableValue as originalUseVariableValue
} from '${reactRepo}'

`;
};
const reactOverrides = `

export type UseVariableValue = <
    K extends string & keyof DVCVariableTypes,
    T extends DVCVariableValue & DVCVariableTypes[K],
>(
    key: K,
    defaultValue: T
) => DVCVariable<T>['value']

export const useVariableValue: UseVariableValue = originalUseVariableValue

export type UseVariable = <
    K extends string & keyof DVCVariableTypes,
    T extends DVCVariableValue & DVCVariableTypes[K],
>(
    key: K,
    defaultValue: T
) => DVCVariable<T>

export const useVariable: UseVariable = originalUseVariable`;

export default class GenerateTypes extends Base {
  static hidden = false;
  static description = "Generate Variable Types from the management API";
  static flags = {
    ...Base.flags,
    "output-dir": Flags.string({
      description: "Directory to output the generated types to",
      default: ".",
    }),
    react: Flags.boolean({
      description: "Generate types for use with React",
      default: false,
    }),
    "old-repos": Flags.boolean({
      description:
        "Generate types for use with old DevCycle repos " +
        "(@devcycle/devcycle-react-sdk, @devcycle/devcycle-js-sdk)",
      default: false,
    }),
    "inline-comments": Flags.boolean({
      description:
        "Inline variable informaton comment on the same line as the type definition",
      default: false,
    }),
    "include-descriptions": Flags.boolean({
      description:
        "Include variable descriptions in the variable information comment",
      default: false,
    }),
  };
  authRequired = true;

  public async run(): Promise<void> {
    const { flags } = await this.parse(GenerateTypes);
    const { project, headless } = flags;
    await this.requireProject(project, headless);

    const variables = await fetchAllVariables(this.authToken, this.projectKey);
    const orgMembers = await fetchOrganizationMembers(this.authToken);
    const typesString = await this.getTypesString(
      variables,
      orgMembers,
      flags["react"],
      flags["old-repos"],
    );

    try {
      if (!fs.existsSync(flags["output-dir"])) {
        fs.mkdirSync(flags["output-dir"], { recursive: true });
      }
      fs.writeFileSync(
        `${flags["output-dir"]}/dvcVariableTypes.ts`,
        typesString,
      );
      this.writer.successMessage(
        `Generated new types to ${flags["output-dir"]}/dvcVariableTypes.ts`,
      );
    } catch (err) {
      let message;
      if (err instanceof Error) message = err.message;
      this.writer.failureMessage(
        `Unable to write to ${flags["output-dir"]}/dvcVariableTypes.ts` +
          `: ${message}`,
      );
    }
  }

  private async getTypesString(
    variables: Variable[],
    orgMembers: OrganizationMember[],
    react: boolean,
    oldRepos: boolean,
  ) {
    const typePromises = variables.map((variable) =>
      this.getTypeDefinitionLine(variable, orgMembers),
    );
    const typeLines = await Promise.all(typePromises);
    let types =
      (react ? reactImports(oldRepos) : "") +
      "type DVCJSON = { [key: string]: string | boolean | number }\n\n" +
      "export type DVCVariableTypes = {\n" +
      typeLines.join("\n") +
      "\n}";
    if (react) {
      types += reactOverrides;
    }
    return types;
  }

  private async getTypeDefinitionLine(
    variable: Variable,
    orgMembers: OrganizationMember[],
  ) {
    const { flags } = await this.parse(GenerateTypes);
    const { "inline-comments": inlineComments } = flags;
    if (inlineComments) {
      return (
        `    ${this.getVariableKeyAndtype(variable)}` +
        `${await this.getVariableInfoComment(variable, orgMembers)}`
      );
    }
    return (
      `${await this.getVariableInfoComment(variable, orgMembers)}\n` +
      `    ${this.getVariableKeyAndtype(variable)}`
    );
  }

  private getVariableKeyAndtype(variable: Variable) {
    return `'${variable.key}': ${this.getVariableType(variable)}`;
  }

  private getVariableType(variable: Variable) {
    if (
      variable.validationSchema &&
      variable.validationSchema.schemaType === "enum"
    ) {
      // TODO fix the schema so it doesn't think enumValues is an object
      const enumValues = variable.validationSchema.enumValues as
        | string[]
        | number[];
      if (enumValues === undefined || enumValues.length === 0) {
        return variable.type.toLocaleLowerCase();
      }
      return enumValues.map((value) => `'${value}'`).join(" | ");
    }
    if (variable.type === "JSON") {
      return "DVCJSON";
    }
    return variable.type.toLocaleLowerCase();
  }

  private async getVariableInfoComment(
    variable: Variable,
    orgMembers: OrganizationMember[],
  ) {
    const { flags } = await this.parse(GenerateTypes);
    const {
      "include-descriptions": includeDescriptions,
      "inline-comments": inlineComments,
    } = flags;

    const descriptionText =
      includeDescriptions && variable.description
        ? `${this.sanitizeDescription(variable.description)}`
        : "";

    const creator = variable._createdBy
      ? this.findCreatorName(orgMembers, variable._createdBy)
      : "Unknown User";
    const createdDate = variable.createdAt.split("T")[0];
    const creationInfo = `created by ${creator} on ${createdDate}`;

    return inlineComments
      ? this.inlineComment(descriptionText, creationInfo)
      : this.blockComment(descriptionText, creator, createdDate);
  }

  private sanitizeDescription(description: string) {
    // Remove newlines, tabs, and carriage returns for proper display
    return description.replace(/[\r\n\t]/g, " ").trim();
  }

  private findCreatorName(orgMembers: OrganizationMember[], creatorId: string) {
    return (
      orgMembers.find((member) => member.user_id === creatorId)?.name ||
      "Unknown User"
    );
  }

  private inlineComment(description: string, creationInfo: string) {
    const descriptionText = description ? `(${description}) ` : "";
    return ` // ${descriptionText}${creationInfo}`;
  }

  private blockComment(
    description: string,
    creator: string,
    createdDate: string,
  ) {
    return (
      "    /*\n" +
      (description !== "" ? `    description: ${description}\n` : "") +
      `    created by: ${creator}\n` +
      `    created on: ${createdDate}\n` +
      "    */"
    );
  }
}
