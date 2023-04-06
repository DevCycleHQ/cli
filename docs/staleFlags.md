`dvc staleFlags`
================



* [`dvc staleFlags`](#dvc-staleflags)

## `dvc staleFlags`

```
USAGE
  $ dvc staleFlags [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [-d <value>] [-t <value>]

FLAGS
  -d, --days=<value>         [default: 30] Days since last update to consider a feature stale.
  -t, --stale-types=<value>  [default: inactive,long-running] Comma-separated list of stale types to check.

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
```

_See code: [dist/commands/staleFlags/index.ts](https://github.com/DevCycleHQ/cli/blob/v4.2.10/dist/commands/staleFlags/index.ts)_
