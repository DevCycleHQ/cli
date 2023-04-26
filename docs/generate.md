`dvc generate`
==============

Generate Devcycle related files

* [`dvc generate types`](#dvc-generate-types)

## `dvc generate types`

Generate Variable Types from the management API

```
USAGE
  $ dvc generate types [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--output-dir <value>] [--react]

FLAGS
  --output-dir=<value>  [default: .] Directory to output the generated types to
  --react               Generate types for use with React

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
