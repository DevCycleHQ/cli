import { executeFileDiff } from "../../diff/fileDiff";
import * as path from "node:path";
import { parseFiles } from "../../diff/parse";
import { expect } from "@oclif/test";

describe("ruby", () => {
  let simpleMatchResult = [
    {
      fileName: "test-utils/fixtures/diff/sampleDiff.rb",
      line: 1,
      mode: "add",
      name: "simple-case",
    },
    {
      fileName: "test-utils/fixtures/diff/sampleDiff.rb",
      line: 3,
      mode: "add",
      name: "multi-line",
    },
    {
      fileName: "test-utils/fixtures/diff/sampleDiff.rb",
      line: 9,
      mode: "add",
      name: "user-object",
    },
  ];
  simpleMatchResult = simpleMatchResult.concat(
    simpleMatchResult.map((match) => {
      return { ...match, line: match.line + 10 };
    }),
  );

  it("identifies the correct variable usages in the Ruby sample diff", () => {
    const parsedDiff = executeFileDiff(
      path.join(__dirname, "../../../../test-utils/fixtures/diff/ruby"),
    );
    const results = parseFiles(parsedDiff);

    expect(results).to.deep.equal({
      ruby: simpleMatchResult,
    });
  });
});
