`dvc overrides`
===============

Create, view, or modify Overrides for a Project with the Management API.

* [`dvc overrides clear`](#dvc-overrides-clear)

## `dvc overrides clear`

Clear Overrides for a given Project.

```
USAGE
  $ dvc overrides clear [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--all]

FLAGS
  --all  All Overrides for the Project

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
  Clear Overrides for a given Project.
```
