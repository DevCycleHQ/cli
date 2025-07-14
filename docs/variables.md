`dvc variables`
===============

Create, view, or modify Variables with the Management API.

* [`dvc variables create`](#dvc-variables-create)
* [`dvc variables get`](#dvc-variables-get)
* [`dvc variables list`](#dvc-variables-list)
* [`dvc variables ls`](#dvc-variables-ls)
* [`dvc variables update [KEY]`](#dvc-variables-update-key)

## `dvc variables create`

Create a new Variable for an existing Feature.

```
USAGE
  $ dvc variables create [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--key <value>] [--name <value>]
    [--type String|Boolean|Number|JSON] [--feature <value>] [--variations <value>] [--description <value>]

FLAGS
  --description=<value>  Description for the dashboard
  --feature=<value>      The key or id of the feature to create the variable for
  --key=<value>          Unique ID
  --name=<value>         Human readable name
  --type=<option>        The type of variable
                         <options: String|Boolean|Number|JSON>
  --variations=<value>   Set a value for this variable in each variation of the associated feature. Should be a JSON
                         object with the keys being variation keys.

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
  Create a new Variable for an existing Feature.
```

_See code: [src/commands/variables/create.ts](https://github.com/DevCycleHQ/cli/blob/v5.21.0/src/commands/variables/create.ts)_

## `dvc variables get`

```
USAGE
  $ dvc variables get [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--keys <value>] [--search <value>]
    [--page <value>] [--per-page <value>]

FLAGS
  --keys=<value>      Comma-separated list of variable keys to fetch details for
  --page=<value>      Page number to fetch
  --per-page=<value>  Number of variables to fetch per page
  --search=<value>    Filter variables by search query

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
```

_See code: [src/commands/variables/get.ts](https://github.com/DevCycleHQ/cli/blob/v5.21.0/src/commands/variables/get.ts)_

## `dvc variables list`

```
USAGE
  $ dvc variables list [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--search <value>] [--page <value>]
    [--per-page <value>]

FLAGS
  --page=<value>      Page number to fetch
  --per-page=<value>  Number of variables to fetch per page
  --search=<value>    Filter variables by search query

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

ALIASES
  $ dvc variables ls
```

_See code: [src/commands/variables/list.ts](https://github.com/DevCycleHQ/cli/blob/v5.21.0/src/commands/variables/list.ts)_

## `dvc variables ls`

```
USAGE
  $ dvc variables ls [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--search <value>] [--page <value>]
    [--per-page <value>]

FLAGS
  --page=<value>      Page number to fetch
  --per-page=<value>  Number of variables to fetch per page
  --search=<value>    Filter variables by search query

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

ALIASES
  $ dvc variables ls
```

## `dvc variables update [KEY]`

Update a Variable.

```
USAGE
  $ dvc variables update [KEY] [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--name <value>] [--description
    <value>]

FLAGS
  --description=<value>  Description for the variable
  --name=<value>         Human readable name

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
  Update a Variable.
```

_See code: [src/commands/variables/update.ts](https://github.com/DevCycleHQ/cli/blob/v5.21.0/src/commands/variables/update.ts)_
