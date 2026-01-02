`dvc generate`
==============

Generate Devcycle related files.

* [`dvc generate types`](#dvc-generate-types)

## `dvc generate types`

Generate Variable Types from the management API

```
USAGE
  $ dvc generate types [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--output-dir <value>] [--react]
    [--nextjs] [--no-declaration] [--old-repos] [--include-descriptions] [--strict-custom-data] [--obfuscate]
    [--include-deprecation-warnings]

FLAGS
  --include-deprecation-warnings  Include @deprecated tags for variables of completed features
  --include-descriptions          Include variable descriptions in the variable information comment
  --nextjs                        Generate types for use with Next.js
  --no-declaration                Do not generate a "declare module" statement that automatically overrides SDK types.
  --obfuscate                     Obfuscate the variable keys.
  --old-repos                     Generate types for use with old DevCycle repos (@devcycle/devcycle-react-sdk,
                                  @devcycle/devcycle-js-sdk)
  --output-dir=<value>            [default: .] Directory to output the generated types to
  --react                         Generate types for use with React
  --strict-custom-data            Generate stricter custom data types

GLOBAL FLAGS
  --auth-path=<value>         Override the default location to look for an auth.yml file
  --client-id=<value>         Client ID to use for DevCycle API Authorization
  --client-secret=<value>     Client Secret to use for DevCycle API Authorization
  --config-path=<value>       Override the default location to look for the user.yml file
  --headless                  Disable all interactive flows and format output for easy parsing.
  --no-api                    Disable API-based enhancements for commands where authorization is optional. Suppresses
                              warnings about missing credentials.
  --project=<value>           Project key to use for the DevCycle API requests
  --repo-config-path=<value>  Override the default location to look for the repo config.yml file

DESCRIPTION
  Generate Variable Types from the management API
```

_See code: [src/commands/generate/types.ts](https://github.com/DevCycleHQ/cli/blob/v6.2.0/src/commands/generate/types.ts)_
