`dvc status`
============

Check CLI status.

* [`dvc status`](#dvc-status)

## `dvc status`

Print CLI version information, configuration file locations and auth status.

```
USAGE
  $ dvc status [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
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
  Print CLI version information, configuration file locations and auth status.
```

_See code: [src/commands/status/index.ts](https://github.com/DevCycleHQ/cli/blob/v5.21.2/src/commands/status/index.ts)_
