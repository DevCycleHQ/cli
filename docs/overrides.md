`dvc overrides`
===============

Create, view, or modify Overrides for a Project with the Management API.

* [`dvc overrides clear`](#dvc-overrides-clear)
* [`dvc overrides get`](#dvc-overrides-get)
* [`dvc overrides list`](#dvc-overrides-list)
* [`dvc overrides ls`](#dvc-overrides-ls)
* [`dvc overrides update`](#dvc-overrides-update)

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

_See code: [src/commands/overrides/clear.ts](https://github.com/DevCycleHQ/cli/blob/v5.20.1/src/commands/overrides/clear.ts)_

## `dvc overrides get`

View the Overrides associated with your DevCycle Identity in your current project.

```
USAGE
  $ dvc overrides get [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--feature <value>] [--environment
    <value>]

FLAGS
  --environment=<value>  The key or id of the Environment to get Overrides for
  --feature=<value>      The key or id of the Feature to get Overrides for

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
  View the Overrides associated with your DevCycle Identity in your current project.
```

_See code: [src/commands/overrides/get.ts](https://github.com/DevCycleHQ/cli/blob/v5.20.1/src/commands/overrides/get.ts)_

## `dvc overrides list`

View the Overrides associated with your DevCycle Identity in your current project.

```
USAGE
  $ dvc overrides list [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--columns <value> | -x] [--sort
    <value>] [--filter <value>] [--output csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ]

FLAGS
  -x, --extended     show extra columns
  --columns=<value>  only show provided columns (comma-separated)
  --csv              output is csv format [alias: --output=csv]
  --filter=<value>   filter property by partial string matching, ex: name=foo
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --output=<option>  output in a more machine friendly format
                     <options: csv|json|yaml>
  --sort=<value>     property to sort by (prepend '-' for descending)

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
  View the Overrides associated with your DevCycle Identity in your current project.

ALIASES
  $ dvc overrides ls
```

_See code: [src/commands/overrides/list.ts](https://github.com/DevCycleHQ/cli/blob/v5.20.1/src/commands/overrides/list.ts)_

## `dvc overrides ls`

View the Overrides associated with your DevCycle Identity in your current project.

```
USAGE
  $ dvc overrides ls [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--columns <value> | -x] [--sort
    <value>] [--filter <value>] [--output csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ]

FLAGS
  -x, --extended     show extra columns
  --columns=<value>  only show provided columns (comma-separated)
  --csv              output is csv format [alias: --output=csv]
  --filter=<value>   filter property by partial string matching, ex: name=foo
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --output=<option>  output in a more machine friendly format
                     <options: csv|json|yaml>
  --sort=<value>     property to sort by (prepend '-' for descending)

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
  View the Overrides associated with your DevCycle Identity in your current project.

ALIASES
  $ dvc overrides ls
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

_See code: [src/commands/overrides/update.ts](https://github.com/DevCycleHQ/cli/blob/v5.20.1/src/commands/overrides/update.ts)_
