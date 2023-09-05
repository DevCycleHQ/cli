`dvc overrides`
===============

Create, view, or modify Overrides for a Project with the Management API.

* [`dvc overrides get`](#dvc-overrides-get)
* [`dvc overrides clear`](#dvc-overrides-clear)
* [`dvc overrides update`](#dvc-overrides-update)

## `dvc overrides get`

View your Self-Targeting overrides.

```
USAGE
  $ dvc overrides get [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--feature <value>] [environment <value>]
FLAGS
  --feature=<value>  The feature associated with the Self-Targeting overrides
  --environment=<value>  The environment associated with the Self-Targeting overrides
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
  View the overrides associated with your DevCycle Identity.
```

## `dvc overrides clear`

Clear Overrides for a given Feature or Project.

```
USAGE
  $ dvc overrides clear [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--all] [--feature <value>]
    [--environment <value>]

FLAGS
  --all                  All Overrides for the Project
  --environment=<value>  The key or id of the Environment to clear the Override for
  --feature=<value>      The key or id of the Feature to clear the Override for

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
  Clear Overrides for a given Feature or Project.
```

## `dvc overrides update`

Update an Override

```
USAGE
  $ dvc overrides update [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--feature <value>] [--environment
    <value>] [--variation <value>]

FLAGS
  --environment=<value>  The environment to update an Override for
  --feature=<value>      The feature to update an Override for
  --variation=<value>    The variation that will be used as the Override

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
  Update an Override

EXAMPLES
  $ dvc overrides update --feature feature-key --environment env-key --variation variation-key
```
