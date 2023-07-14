`dvc diff`
==========

Print a diff of DevCycle variable usage between two versions of your code.

* [`dvc diff [DIFF-PATTERN]`](#dvc-diff-diff-pattern)

## `dvc diff [DIFF-PATTERN]`

Print a diff of DevCycle variable usage between two versions of your code.

```
USAGE
  $ dvc diff [DIFF-PATTERN] [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>]
    [--client-id <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [-f <value>]
    [--client-name <value>] [--match-pattern <value>] [--var-alias <value>] [--format console|markdown|markdown-no-html]
    [--show-regex]

ARGUMENTS
  DIFF-PATTERN  A "git diff"-compatible diff pattern, eg. "branch1 branch2"

FLAGS
  -f, --file=<value>          File path of existing diff file to inspect.
  --client-name=<value>...    Name(s) of the DevCycle client variable to match on. Accepts multiple values.
  --format=<option>           [default: console] Format to use when outputting the diff results.
                              <options: console|markdown|markdown-no-html>
  --match-pattern=<value>...  Additional full Regex pattern to use to match variable usages in your code. Should contain
                              exactly one capture group which matches on the key of the variable. Must specify the file
                              extension to override the pattern for, eg. "--match-pattern js=<YOUR PATTERN>"
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
  Print a diff of DevCycle variable usage between two versions of your code.

EXAMPLES
  $ dvc diff

  $ dvc diff --match-pattern js="dvcClient\.variable\(\s*["']([^"']*)["']"
```

_See code: [dist/commands/diff/index.ts](https://github.com/DevCycleHQ/cli/blob/v4.6.3/dist/commands/diff/index.ts)_
