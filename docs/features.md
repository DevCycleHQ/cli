`dvc features`
==============

Create, view, or modify Features with the Management API.

* [`dvc features create`](#dvc-features-create)
* [`dvc features delete [FEATURE]`](#dvc-features-delete-feature)
* [`dvc features get [KEYS]`](#dvc-features-get-keys)
* [`dvc features list`](#dvc-features-list)
* [`dvc features ls`](#dvc-features-ls)
* [`dvc features update [KEY]`](#dvc-features-update-key)

## `dvc features create`

Create a new Feature.

```
USAGE
  $ dvc features create [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--key <value>] [--name <value>]
    [--variables <value>] [--variations <value>] [--sdkVisibility <value>] [-i]

FLAGS
  -i, --interactive        Interactive Feature Creation Mode
  --key=<value>            Unique ID
  --name=<value>           Human readable name
  --sdkVisibility=<value>  The visibility of the feature for the SDKs
  --variables=<value>      The variables to create for the feature
  --variations=<value>     The variations to set for the feature

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
  Create a new Feature.
```

_See code: [src/commands/features/create.ts](https://github.com/DevCycleHQ/cli/blob/v6.2.0/src/commands/features/create.ts)_

## `dvc features delete [FEATURE]`

Delete a feature

```
USAGE
  $ dvc features delete [FEATURE] [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>]
    [--client-id <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless]

ARGUMENTS
  FEATURE  Feature key or id to delete

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
  Delete a feature
```

_See code: [src/commands/features/delete.ts](https://github.com/DevCycleHQ/cli/blob/v6.2.0/src/commands/features/delete.ts)_

## `dvc features get [KEYS]`

Retrieve Features from the Management API

```
USAGE
  $ dvc features get [KEYS] [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>]
    [--client-id <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--keys <value>]
    [--search <value>] [--page <value>] [--per-page <value>]

ARGUMENTS
  KEYS  Feature keys to fetch (space-separated or comma-separated)

FLAGS
  --keys=<value>      Comma-separated list of feature keys to fetch details for
  --page=<value>      Page number to fetch
  --per-page=<value>  Number of features to fetch per page
  --search=<value>    Filter features by search query

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
  Retrieve Features from the Management API

EXAMPLES
  $ dvc features get

  $ dvc features get feature-one

  $ dvc features get feature-one feature-two

  $ dvc features get feature-one,feature-two

  $ dvc features get --keys=feature-one,feature-two
```

_See code: [src/commands/features/get.ts](https://github.com/DevCycleHQ/cli/blob/v6.2.0/src/commands/features/get.ts)_

## `dvc features list`

View all features in a project

```
USAGE
  $ dvc features list [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--search <value>] [--page <value>]
    [--per-page <value>]

FLAGS
  --page=<value>      Page number to fetch
  --per-page=<value>  Number of features to fetch per page
  --search=<value>    Filter features by search query

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
  View all features in a project

ALIASES
  $ dvc features ls
```

_See code: [src/commands/features/list.ts](https://github.com/DevCycleHQ/cli/blob/v6.2.0/src/commands/features/list.ts)_

## `dvc features ls`

View all features in a project

```
USAGE
  $ dvc features ls [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--search <value>] [--page <value>]
    [--per-page <value>]

FLAGS
  --page=<value>      Page number to fetch
  --per-page=<value>  Number of features to fetch per page
  --search=<value>    Filter features by search query

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
  View all features in a project

ALIASES
  $ dvc features ls
```

## `dvc features update [KEY]`

Update a Feature.

```
USAGE
  $ dvc features update [KEY] [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--name <value>] [--variables
    <value>] [--variations <value>] [--sdkVisibility <value>] [--key <value>] [--description <value>]

FLAGS
  --description=<value>    A description of the feature
  --key=<value>            The unique key of the feature
  --name=<value>           Human readable name
  --sdkVisibility=<value>  The visibility of the feature for the SDKs
  --variables=<value>      The variables to set for the feature
  --variations=<value>     The variations to set for the feature

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
  Update a Feature.
```

_See code: [src/commands/features/update.ts](https://github.com/DevCycleHQ/cli/blob/v6.2.0/src/commands/features/update.ts)_
