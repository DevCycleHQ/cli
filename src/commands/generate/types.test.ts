import { expect } from "@oclif/test";
import { BASE_URL } from "../../api/common";
import { dvcTest } from "../../../test-utils";
import * as fs from "fs";

const mockVariablesResponse = [
  {
    name: "enum-var",
    key: "enum-var",
    type: "String",
    description: "Different ways to say hello",
    createdAt: "2021-07-04T20:00:00.000Z",
    _createdBy: "user1",
    validationSchema: {
      schemaType: "enum",
      enumValues: ["Hello", "Hey", "Hi"],
    },
  },
  {
    name: "regex-var",
    key: "regex-var",
    type: "String",
    createdAt: "2021-07-04T20:00:00.000Z",
    _createdBy: "user2",
    validationSchema: {
      schemaType: "regex",
      regexPattern: "^test.*$",
    },
  },
  {
    name: "string-var",
    key: "string-var",
    type: "String",
    _createdBy: "user1",
    createdAt: "2021-07-04T20:00:00.000Z",
  },
  {
    name: "boolean-var",
    key: "boolean-var",
    type: "Boolean",
    _createdBy: "user2",
    createdAt: "2021-07-04T20:00:00.000Z",
  },
  {
    name: "number-var",
    key: "number-var",
    type: "Number",
    _createdBy: "user1",
    createdAt: "2021-07-04T20:00:00.000Z",
  },
  {
    name: "json-var",
    key: "json-var",
    type: "JSON",
    createdAt: "2021-07-04T20:00:00.000Z",
    _createdBy: "api",
  },
];

const mockOrganizationMembersResponse = [
  {
    user_id: "user1",
    name: "User 1",
    email: "test@gmail.com",
  },
  {
    user_id: "user2",
    name: "User 2",
    email: "test2@gmail.com",
  },
];

const artifactsDir = "./test/artifacts/";
const jsOutputDir = artifactsDir + "generate/js";
const reactOutputDir = artifactsDir + "generate/react";

const expectedTypesString = `type DVCJSON = { [key: string]: string | boolean | number }

export type DVCVariableTypes = {
    /*
    created by: User 1
    created on: 2021-07-04
    */
    'enum-var': 'Hello' | 'Hey' | 'Hi'
    /*
    created by: User 2
    created on: 2021-07-04
    */
    'regex-var': string
    /*
    created by: User 1
    created on: 2021-07-04
    */
    'string-var': string
    /*
    created by: User 2
    created on: 2021-07-04
    */
    'boolean-var': boolean
    /*
    created by: User 1
    created on: 2021-07-04
    */
    'number-var': number
    /*
    created by: Unknown User
    created on: 2021-07-04
    */
    'json-var': DVCJSON
}`;

const expectedReactTypesString = `import { DVCVariable, DVCVariableValue } from '@devcycle/js-client-sdk'
import {
    useVariable as originalUseVariable,
    useVariableValue as originalUseVariableValue
} from '@devcycle/react-client-sdk'

type DVCJSON = { [key: string]: string | boolean | number }

export type DVCVariableTypes = {
    /*
    created by: User 1
    created on: 2021-07-04
    */
    'enum-var': 'Hello' | 'Hey' | 'Hi'
    /*
    created by: User 2
    created on: 2021-07-04
    */
    'regex-var': string
    /*
    created by: User 1
    created on: 2021-07-04
    */
    'string-var': string
    /*
    created by: User 2
    created on: 2021-07-04
    */
    'boolean-var': boolean
    /*
    created by: User 1
    created on: 2021-07-04
    */
    'number-var': number
    /*
    created by: Unknown User
    created on: 2021-07-04
    */
    'json-var': DVCJSON
}

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

const expectedTypesStringInlinedWithDescriptions = `type DVCJSON = { [key: string]: string | boolean | number }

export type DVCVariableTypes = {
    'enum-var': 'Hello' | 'Hey' | 'Hi' // (Different ways to say hello) created by User 1 on 2021-07-04
    'regex-var': string // created by User 2 on 2021-07-04
    'string-var': string // created by User 1 on 2021-07-04
    'boolean-var': boolean // created by User 2 on 2021-07-04
    'number-var': number // created by User 1 on 2021-07-04
    'json-var': DVCJSON // created by Unknown User on 2021-07-04
}`;

describe("generate types", () => {
  after(() => {
    fs.rmSync(artifactsDir, { recursive: true });
  });

  dvcTest()
    .nock(BASE_URL, (api) =>
      api
        .get("/v1/projects/project/variables?perPage=1000&page=1&status=active")
        .reply(200, mockVariablesResponse)
        .get("/v1/organizations/current/members")
        .reply(200, mockOrganizationMembersResponse),
    )
    .stdout()
    .command([
      "generate:types",
      "--output-dir",
      jsOutputDir,
      "--client-id",
      "client",
      "--client-secret",
      "secret",
      "--project",
      "project",
    ])
    .it("correctly generates JS SDK types", (ctx) => {
      const outputDir = jsOutputDir + "/dvcVariableTypes.ts";
      expect(ctx.stdout).to.contain(`Generated new types to ${outputDir}`);
      expect(fs.existsSync(outputDir)).to.be.true;
      const typesString = fs.readFileSync(outputDir, "utf-8");
      expect(typesString).to.equal(expectedTypesString);
    });

  dvcTest()
    .nock(BASE_URL, (api) =>
      api
        .get("/v1/projects/project/variables?perPage=1000&page=1&status=active")
        .reply(200, mockVariablesResponse)
        .get("/v1/organizations/current/members")
        .reply(200, mockOrganizationMembersResponse),
    )
    .stdout()
    .command([
      "generate:types",
      "--react",
      "--output-dir",
      reactOutputDir,
      "--client-id",
      "client",
      "--client-secret",
      "secret",
      "--project",
      "project",
    ])
    .it("correctly generates React SDK types", (ctx) => {
      const outputDir = reactOutputDir + "/dvcVariableTypes.ts";
      expect(fs.existsSync(outputDir)).to.be.true;
      const typesString = fs.readFileSync(outputDir, "utf-8");
      expect(typesString).to.equal(expectedReactTypesString);
      expect(ctx.stdout).to.contain(`Generated new types to ${outputDir}`);
    });

  dvcTest()
    .nock(BASE_URL, (api) =>
      api
        .get("/v1/projects/project/variables?perPage=1000&page=1&status=active")
        .reply(200, mockVariablesResponse)
        .get("/v1/organizations/current/members")
        .reply(200, mockOrganizationMembersResponse),
    )
    .stdout()
    .command([
      "generate:types",
      "--react",
      "--old-repos",
      "--output-dir",
      reactOutputDir,
      "--client-id",
      "client",
      "--client-secret",
      "secret",
      "--project",
      "project",
    ])
    .it("correctly generates React SDK types with old-repos flag", (ctx) => {
      const outputDir = reactOutputDir + "/dvcVariableTypes.ts";
      expect(fs.existsSync(outputDir)).to.be.true;
      const typesString = fs.readFileSync(outputDir, "utf-8");
      expect(typesString).to.contain("@devcycle/devcycle-js-sdk");
      expect(typesString).to.contain("@devcycle/devcycle-react-sdk");
      expect(ctx.stdout).to.contain(`Generated new types to ${outputDir}`);
    });

  dvcTest()
    .nock(BASE_URL, (api) =>
      api
        .get("/v1/projects/project/variables?perPage=1000&page=1&status=active")
        .reply(200, mockVariablesResponse)
        .get("/v1/organizations/current/members")
        .reply(200, mockOrganizationMembersResponse),
    )
    .stdout()
    .command([
      "generate:types",
      "--output-dir",
      jsOutputDir,
      "--client-id",
      "client",
      "--client-secret",
      "secret",
      "--project",
      "project",
      "--include-descriptions",
      "--inline-comments",
    ])
    .it("correctly generates JS SDK types with inlined comments", (ctx) => {
      const outputDir = jsOutputDir + "/dvcVariableTypes.ts";
      expect(ctx.stdout).to.contain(`Generated new types to ${outputDir}`);
      expect(fs.existsSync(outputDir)).to.be.true;
      const typesString = fs.readFileSync(outputDir, "utf-8");
      expect(typesString).to.equal(expectedTypesStringInlinedWithDescriptions);
    });
});
