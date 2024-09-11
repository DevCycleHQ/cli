`dvc prompt`
============

Replace a DevCycle variable with a static value in the current version of your code. Currently only JavaScript is supported.

* [`dvc prompt [KEY]`](#dvc-prompt-key)

## `dvc prompt [KEY]`

Replace a DevCycle variable with a static value in the current version of your code. Currently only JavaScript is supported.

```
USAGE
  $ dvc prompt [KEY] [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless]

ARGUMENTS
  KEY  Key of variable to replace.

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
  Replace a DevCycle variable with a static value in the current version of your code. Currently only JavaScript is
  supported.

EXAMPLES
  $ dvc prompt

  $ dvc prompt my-variable-key --value true --type Boolean

  $ dvc prompt some-var --value "My Custom Name" --type String
```

_See code: [src/commands/prompt/index.ts](https://github.com/DevCycleHQ/cli/blob/v5.17.0/src/commands/prompt/index.ts)_
