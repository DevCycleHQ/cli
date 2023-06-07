`dvc targeting`
===============

Retrieve Targeting for a Feature from the Management API

* [`dvc targeting get [FEATURE]`](#dvc-targeting-get-feature)

## `dvc targeting get [FEATURE]`

Retrieve Targeting for a Feature from the Management API

```
USAGE
  $ dvc targeting get [FEATURE] [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>]
    [--client-id <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [-e <value>]

ARGUMENTS
  FEATURE  The Feature to get the Targeting Rules

FLAGS
  -e, --env=<value>  Environment to fetch the Feature Configuration

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
  Retrieve Targeting for a Feature from the Management API

EXAMPLES
  $ dvc targeting get feature-one

  $ dvc targeting get feature-one environment-one
```
