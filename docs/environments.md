`dvc environments`
==================

Create a new Environment for an existing Feature.

* [`dvc environments create`](#dvc-environments-create)
* [`dvc environments get [KEYS]`](#dvc-environments-get-keys)
* [`dvc environments list`](#dvc-environments-list)
* [`dvc environments ls`](#dvc-environments-ls)
* [`dvc environments update [KEY]`](#dvc-environments-update-key)

## `dvc environments create`

Create a new Environment for an existing Feature.

```
USAGE
  $ dvc environments create [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--key <value>] [--name <value>]
    [--type development|staging|production|disaster_recovery] [--description <value>]

FLAGS
  --description=<value>  Description for the dashboard
  --key=<value>          Unique ID
  --name=<value>         Human readable name
  --type=<option>        The type of environment
                         <options: development|staging|production|disaster_recovery>

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
  Create a new Environment for an existing Feature.
```

_See code: [src/commands/environments/create.ts](https://github.com/DevCycleHQ/cli/blob/v6.0.2/src/commands/environments/create.ts)_

## `dvc environments get [KEYS]`

Retrieve Environments from the management API

```
USAGE
  $ dvc environments get [KEYS] [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>]
    [--client-id <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--keys <value>]

ARGUMENTS
  KEYS  Environment keys to fetch (space-separated or comma-separated)

FLAGS
  --keys=<value>  Comma-separated list of environment keys to fetch details for

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
  Retrieve Environments from the management API

EXAMPLES
  $ dvc environments get

  $ dvc environments get environment-one

  $ dvc environments get environment-one environment-two

  $ dvc environments get environment-one,environment-two

  $ dvc environments get --keys=environment-one,environment-two
```

_See code: [src/commands/environments/get.ts](https://github.com/DevCycleHQ/cli/blob/v6.0.2/src/commands/environments/get.ts)_

## `dvc environments list`

```
USAGE
  $ dvc environments list [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless]

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
  $ dvc environments ls
```

_See code: [src/commands/environments/list.ts](https://github.com/DevCycleHQ/cli/blob/v6.0.2/src/commands/environments/list.ts)_

## `dvc environments ls`

```
USAGE
  $ dvc environments ls [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless]

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
  $ dvc environments ls
```

## `dvc environments update [KEY]`

Update a Environment.

```
USAGE
  $ dvc environments update [KEY] [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--name <value>] [--key <value>]
    [--type development|staging|production|disaster_recovery] [--description <value>]

FLAGS
  --description=<value>  Description for the environment
  --key=<value>          Unique ID
  --name=<value>         Human readable name
  --type=<option>        The type of environment
                         <options: development|staging|production|disaster_recovery>

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
  Update a Environment.
```

_See code: [src/commands/environments/update.ts](https://github.com/DevCycleHQ/cli/blob/v6.0.2/src/commands/environments/update.ts)_
