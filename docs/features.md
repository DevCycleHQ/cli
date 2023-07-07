`dvc features`
==============

Create, view, or modify Features with the Management API.

* [`dvc features create`](#dvc-features-create)
* [`dvc features delete [FEATURE]`](#dvc-features-delete-feature)
* [`dvc features get`](#dvc-features-get)
* [`dvc features list`](#dvc-features-list)
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

## `dvc features get`

Retrieve Features from the management API

```
USAGE
  $ dvc features get [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--keys <value>]

FLAGS
  --keys=<value>  Comma-separated list of feature keys to fetch details for

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
  Retrieve Features from the management API

EXAMPLES
  $ dvc features get

  $ dvc features get --keys=feature-one,feature-two
```

## `dvc features list`

View all features in a project

```
USAGE
  $ dvc features list [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
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

DESCRIPTION
  View all features in a project
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
