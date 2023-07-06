`dvc login`
===========

Log in to DevCycle.

* [`dvc login again`](#dvc-login-again)
* [`dvc login sso`](#dvc-login-sso)

## `dvc login again`

Log in through the DevCycle Universal Login, using saved credentials only.This will open a browser window.

```
USAGE
  $ dvc login again [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--org <value>]

FLAGS
  --org=<value>  The `name` of the org to sign in as (not the `display_name`)

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
  Log in through the DevCycle Universal Login, using saved credentials only.This will open a browser window.

EXAMPLES
  $ dvc login again
```

## `dvc login sso`

Log in through the DevCycle Universal Login. This will open a browser window.

```
USAGE
  $ dvc login sso [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--org <value>]

FLAGS
  --org=<value>  The `name` of the org to sign in as (not the `display_name`)

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
  Log in through the DevCycle Universal Login. This will open a browser window.
```
