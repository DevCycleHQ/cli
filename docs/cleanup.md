`dvc cleanup`
=============

Replace a DevCycle variable with a static value in the current version of your code. Currently only JavaScript is supported.

* [`dvc cleanup [KEY]`](#dvc-cleanup-key)

## `dvc cleanup [KEY]`

Replace a DevCycle variable with a static value in the current version of your code. Currently only JavaScript is supported.

```
USAGE
  $ dvc cleanup [KEY] [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--value <value>] [--type
    String|Boolean|Number|JSON] [--include <value>] [--exclude <value>] [--output console|file] [--var-alias <value>]

ARGUMENTS
  KEY  Key of variable to replace.

FLAGS
  --exclude=<value>...    Files to exclude when scanning for variables to cleanup. By default all files are included.
                          Accepts multiple glob patterns.
  --include=<value>...    Files to include when scanning for variables to cleanup. By default all files are included.
                          Accepts multiple glob patterns.
  --output=<option>       [default: file] Where the refactored code will be output. By default it overwrites the source
                          file.
                          <options: console|file>
  --type=<option>         The type of the value that will be replacing the variable. Valid values include: String,
                          Boolean, Number, JSON
                          <options: String|Boolean|Number|JSON>
  --value=<value>         Value to use in place of variable.
  --var-alias=<value>...  Aliases to use when identifying variables in your code. Should contain a code reference mapped
                          to a DevCycle variable key, eg. "--var-alias "VARIABLES.ENABLE_V1=enable-v1"

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
  $ dvc cleanup

  $ dvc cleanup my-variable-key --value true --type Boolean

  $ dvc cleanup some-var --value "My Custom Name" --type String
```

_See code: [dist/commands/cleanup/index.ts](https://github.com/DevCycleHQ/cli/blob/v5.0.0/dist/commands/cleanup/index.ts)_
