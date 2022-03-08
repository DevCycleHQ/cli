`dvc features`
==============

Access or modify Features with the Management API

* [`dvc features get`](#dvc-features-get)
* [`dvc features list`](#dvc-features-list)

## `dvc features get`

Retrieve Features from the management API

```
USAGE
  $ dvc features get [--config-path <value>] [--auth-path <value>] [--client-id <value>] [--client-secret <value>]
    [--project <value>] [--no-api] [--keys <value>]

FLAGS
  --keys=<value>  Comma-separated list of feature keys to fetch details for

GLOBAL FLAGS
  --auth-path=<value>      [default: .devcycle/auth.yml] Override the default location to look for an auth.yml file
  --client-id=<value>      Client ID to use for DevCycle API Authorization
  --client-secret=<value>  Client Secret to use for DevCycle API Authorization
  --config-path=<value>    [default: .devcycle/config.yml] Override the default location to look for a config.yml file
  --no-api                 Disable API-based enhancements for commands where authorization is optional. Suppresses
                           warnings about missing credentials.
  --project=<value>        Project key to use for the DevCycle API requests

DESCRIPTION
  Retrieve Features from the management API

EXAMPLES
  $ dvc features get

  $ dvc features get --keys=feature-one,feature-two
```

## `dvc features list`

```
USAGE
  $ dvc features list [--config-path <value>] [--auth-path <value>] [--client-id <value>] [--client-secret <value>]
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
