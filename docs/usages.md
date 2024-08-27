`dvc usages`
============

Print all DevCycle variable usages in the current version of your code.

* [`dvc usages`](#dvc-usages)

## `dvc usages`

Print all DevCycle variable usages in the current version of your code.

```
USAGE
  $ dvc usages [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--include <value>] [--exclude
    <value>] [--client-name <value>] [--match-pattern <value>] [--var-alias <value>] [--format console|json]
    [--show-regex] [--only-unused] [-o <value>]

FLAGS
  -o, --output=<value>        Output file path for JSON format. If not specified, output will be written to stdout.
  --client-name=<value>...    Name(s) of the DevCycle client variable to match on. Accepts multiple values.
  --exclude=<value>...        Files to exclude when scanning for usages. By default all files are included. Accepts
                              multiple glob patterns.
  --format=<option>           [default: console] Format to use when outputting the usage results.
                              <options: console|json>
  --include=<value>...        Files to include when scanning for usages. By default all files are included. Accepts
                              multiple glob patterns.
  --match-pattern=<value>...  Additional full Regex pattern to use to match variable usages in your code. Should contain
                              exactly one capture group which matches on the key of the variable. Must specify the file
                              extension to override the pattern for, eg. "--match-pattern js=<YOUR PATTERN>"
  --only-unused               Show usages of variables that are not defined in your DevCycle config.
  --show-regex                Output the regex pattern used to find variable usage
  --var-alias=<value>...      Aliases to use when identifying variables in your code. Should contain a code reference
                              mapped to a DevCycle variable key, eg. "--var-alias "VARIABLES.ENABLE_V1=enable-v1"

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
  Print all DevCycle variable usages in the current version of your code.

EXAMPLES
  $ dvc usages

  $ dvc usages --match-pattern js="dvcClient\.variable\(\s*["']([^"']*)["']"
```

_See code: [src/commands/usages/index.ts](https://github.com/DevCycleHQ/cli/blob/v5.16.1/src/commands/usages/index.ts)_
