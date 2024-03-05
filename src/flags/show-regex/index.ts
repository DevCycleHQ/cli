import { Flags } from "@oclif/core";

export default Flags.boolean({
  description: "Output the regex pattern used to find variable usage",
});

export function showRegex(flags: Record<string, any>) {
  return flags["show-regex"];
}
