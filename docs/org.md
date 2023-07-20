`dvc org`
=========

Switch organizations.

* [`dvc org`](#dvc-org)

## `dvc org`

Select which organization to access through the API

```
USAGE
  $ dvc org [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
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
  Select which organization to access through the API
```

_See code: [dist/commands/org/index.ts](https://github.com/DevCycleHQ/cli/blob/v4.6.4/dist/commands/org/index.ts)_
