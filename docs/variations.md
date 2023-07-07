`dvc variations`
================

Create a new Variation for an existing Feature.

* [`dvc variations create [FEATURE]`](#dvc-variations-create-feature)
* [`dvc variations get [FEATURE]`](#dvc-variations-get-feature)
* [`dvc variations list [FEATURE]`](#dvc-variations-list-feature)
* [`dvc variations update [FEATURE] [KEY]`](#dvc-variations-update-feature-key)

## `dvc variations create [FEATURE]`

Create a new Variation for an existing Feature.

```
USAGE
  $ dvc variations create [FEATURE] [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>]
    [--client-id <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--key <value>] [--name
    <value>] [--variables <value>]

ARGUMENTS
  FEATURE  Feature key or id

FLAGS
  --key=<value>        Unique ID
  --name=<value>       Human readable name
  --variables=<value>  The variables to create for the variation

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
  Create a new Variation for an existing Feature.

EXAMPLES
  $ dvc variations create

  $ dvc variations create --variables='{ "bool-var": true, "num-var": 80, "string-var": "test" }'
```

## `dvc variations get [FEATURE]`

Retrieve variations for a feature from the management API

```
USAGE
  $ dvc variations get [FEATURE] [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>]
    [--client-id <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless]

ARGUMENTS
  FEATURE  Feature key or id

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
  Retrieve variations for a feature from the management API
```

## `dvc variations list [FEATURE]`

List the keys of all variations in a feature

```
USAGE
  $ dvc variations list [FEATURE] [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>]
    [--client-id <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless]

ARGUMENTS
  FEATURE  Feature key or id

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
  List the keys of all variations in a feature
```

## `dvc variations update [FEATURE] [KEY]`

Update a Variation.

```
USAGE
  $ dvc variations update [FEATURE] [KEY] [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>]
    [--client-id <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--name <value>]
    [--variables <value>] [--key <value>]

ARGUMENTS
  FEATURE  Feature key or ID
  KEY

FLAGS
  --key=<value>        The variation key
  --name=<value>       Human readable name
  --variables=<value>  The variables to create for the variation

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
  Update a Variation.
```
