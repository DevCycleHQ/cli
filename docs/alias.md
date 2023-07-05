`dvc alias`
===========

Manage repository variable aliases.

* [`dvc alias add`](#dvc-alias-add)

## `dvc alias add`

Add a variable alias to the repo configuration

```
USAGE
  $ dvc alias add [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--alias <value>] [--variable
    <value>]

FLAGS
  --alias=<value>     The alias used in the code
  --variable=<value>  The DevCycle variable key

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
  Add a variable alias to the repo configuration

EXAMPLES
  $ dvc alias add

  $ dvc alias add --alias=VARIABLE_ALIAS --variable=variable-key
```
