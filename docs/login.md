`dvc login`
===========

Log in to DevCycle

* [`dvc login sso`](#dvc-login-sso)

## `dvc login sso`

Log in through the DevCycle Universal Login. This will open a browser window

```
USAGE
  $ dvc login sso [--config-path <value>] [--auth-path <value>] [--client-id <value>] [--client-secret <value>]
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
  Log in through the DevCycle Universal Login. This will open a browser window
```
