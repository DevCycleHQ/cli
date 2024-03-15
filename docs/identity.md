`dvc identity`
==============

View or manage your DevCycle Identity.

* [`dvc identity get`](#dvc-identity-get)
* [`dvc identity update`](#dvc-identity-update)

## `dvc identity get`

Print your DevCycle Identity.

```
USAGE
  $ dvc identity get [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
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
  Print your DevCycle Identity.
```

_See code: [src/commands/identity/get.ts](https://github.com/DevCycleHQ/cli/blob/v5.14.3/src/commands/identity/get.ts)_

## `dvc identity update`

Update your DevCycle Identity.

```
USAGE
  $ dvc identity update [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--userId <value>]

FLAGS
  --userId=<value>  DevCycle Identity User ID to be used for Overrides & Self-Targeting

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
  Update your DevCycle Identity.
```

_See code: [src/commands/identity/update.ts](https://github.com/DevCycleHQ/cli/blob/v5.14.3/src/commands/identity/update.ts)_
