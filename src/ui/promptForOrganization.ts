import inquirer, { autocompleteSearch } from "../ui/autocomplete";
import { Organization } from "../api/organizations";

export async function promptForOrganization(
  organizations: Organization[],
): Promise<Organization> {
  const organizationOptions = organizations.map((organization) => {
    return {
      name: organization.display_name,
      value: organization,
    };
  });
  const responses = await inquirer.prompt([
    {
      name: "organization",
      message: "Which organization do you want to use?",
      type: "autocomplete",
      source: (_input: never, search: string) =>
        autocompleteSearch(organizationOptions, search),
    },
  ]);
  return responses.organization;
}
