import { Flags } from "@oclif/core";
import { fetchFeatures } from "../../api/features";
import Base from "../base";

export default class ListFeatures extends Base {
  static aliases: string[] = ["features:ls"];
  static hidden = false;
  static description = "View all features in a project";
  static flags = {
    ...Base.flags,
    search: Flags.string({
      description: "Filter features by search query",
    }),
    page: Flags.integer({
      description: "Page number to fetch",
    }),
    "per-page": Flags.integer({
      description: "Number of features to fetch per page",
    }),
  };
  authRequired = true;

  public async run(): Promise<void> {
    const { flags } = await this.parse(ListFeatures);
    const { project, headless } = flags;
    await this.requireProject(project, headless);

    const query = {
      page: flags["page"],
      perPage: flags["per-page"],
      search: flags["search"],
    };
    const features = await fetchFeatures(
      this.authToken,
      this.projectKey,
      query,
    );
    const featureKeys = features.map((feature) => feature.key);
    this.writer.showResults(featureKeys);
  }
}
