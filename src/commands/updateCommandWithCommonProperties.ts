import UpdateCommand from "./updateCommand";
import { Args, Flags } from "@oclif/core";

export default abstract class UpdateCommandWithCommonProperties extends UpdateCommand {
  static args = {
    key: Args.string({
      key: Flags.string({
        description: "Unique ID",
      }),
      parse: async (input: string) => {
        return input.toLowerCase();
      },
    }),
  };

  static flags = {
    ...UpdateCommand.flags,
    name: Flags.string({
      description: "Human readable name",
    }),
  };
}
