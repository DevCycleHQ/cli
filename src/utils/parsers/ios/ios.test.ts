import { executeFileDiff } from "../../diff/fileDiff";
import * as path from "node:path";
import { parseFiles } from "../../diff/parse";
import { expect } from "@oclif/test";

describe("ios", () => {
  let simpleMatchResult = [
    {
      fileName: "test-utils/fixtures/diff/sampleDiff.swift",
      line: 1,
      mode: "add",
      name: "simple-case",
    },
    {
      fileName: "test-utils/fixtures/diff/sampleDiff.swift",
      line: 3,
      mode: "add",
      name: "multi-line",
    },
    {
      fileName: "test-utils/fixtures/diff/sampleDiff.swift",
      line: 9,
      mode: "add",
      name: "default-value-object",
    },
  ];
  simpleMatchResult = simpleMatchResult.concat(
    simpleMatchResult.map((match) => {
      return { ...match, line: match.line + 10 };
    }),
  );

  it("identifies the correct variable usages in the iOS sample diff", () => {
    const parsedDiff = executeFileDiff(
      path.join(__dirname, "../../../../test-utils/fixtures/diff/ios"),
    );
    const results = parseFiles(parsedDiff);

    expect(results).to.deep.equal({
      ios: simpleMatchResult,
    });
  });
});
