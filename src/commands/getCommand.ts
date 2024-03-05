import Base from "./base";
import { Flags } from "@oclif/core";

export default abstract class GetCommand extends Base {
  authRequired = true;

  static flags = {
    ...Base.flags,
    sortBy: Flags.string({
      description: "Sort By",
      options: ["key", "name", "updatedAt", "createdAt"],
    }),
    sortOrder: Flags.string({
      description: "Sort Order",
      options: ["asc", "desc"],
    }),
  };
}
