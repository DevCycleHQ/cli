`dvc variables`
===============

Access or modify Variables with the Management API

* [`dvc variables create`](#dvc-variables-create)
* [`dvc variables get`](#dvc-variables-get)
* [`dvc variables list`](#dvc-variables-list)

## `dvc variables create`

Create a new Variable for an existing Feature.

```
USAGE
  $ dvc variables create [--config-path <value>] [--auth-path <value>] [--client-id <value>] [--client-secret <value>]
    [--project <value>] [--no-api]

GLOBAL FLAGS
  --auth-path=<value>      [default: .devcycle/auth.yml] Override the default location to look for an auth.yml file
  --client-id=<value>      Client ID to use for DevCycle API Authorization
  --client-secret=<value>  Client Secret to use for DevCycle API Authorization
  --config-path=<value>    [default: .devcycle/config.yml] Override the default location to look for a config.yml file
  --no-api                 Disable API-based enhancements for commands where authorization is optional. Suppresses
                           warnings about missing credentials.
  --project=<value>        Project key to use for the DevCycle API requests

DESCRIPTION
  Create a new Variable for an existing Feature.
```

## `dvc variables get`

```
USAGE
  $ dvc variables get [--config-path <value>] [--auth-path <value>] [--client-id <value>] [--client-secret <value>]
    [--project <value>] [--no-api] [--keys <value>]

FLAGS
  --keys=<value>  Comma-separated list of variable keys to fetch details for

GLOBAL FLAGS
  --auth-path=<value>      [default: .devcycle/auth.yml] Override the default location to look for an auth.yml file
  --client-id=<value>      Client ID to use for DevCycle API Authorization
  --client-secret=<value>  Client Secret to use for DevCycle API Authorization
  --config-path=<value>    [default: .devcycle/config.yml] Override the default location to look for a config.yml file
  --no-api                 Disable API-based enhancements for commands where authorization is optional. Suppresses
                           warnings about missing credentials.
  --project=<value>        Project key to use for the DevCycle API requests
```

## `dvc variables list`

```
USAGE
  $ dvc variables list [--config-path <value>] [--auth-path <value>] [--client-id <value>] [--client-secret <value>]
    [--project <value>] [--no-api]

GLOBAL FLAGS
  --auth-path=<value>      [default: .devcycle/auth.yml] Override the default location to look for an auth.yml file
  --client-id=<value>      Client ID to use for DevCycle API Authorization
  --client-secret=<value>  Client Secret to use for DevCycle API Authorization
  --config-path=<value>    [default: .devcycle/config.yml] Override the default location to look for a config.yml file
  --no-api                 Disable API-based enhancements for commands where authorization is optional. Suppresses
                           warnings about missing credentials.
  --project=<value>        Project key to use for the DevCycle API requests
```
