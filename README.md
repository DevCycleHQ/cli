DevCycle CLI
=================

DevCycle CLI for interacting with DevCycle features from the command line.

The CLI can be customized in several ways using command-line args or by creating a [configuration file](#configuration).

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@devcycle/cli.svg)](https://www.npmjs.com/package/@devcycle/cli)
[![License](https://img.shields.io/npm/l/@devcycle/cli.svg)](https://github.com/DevCycleHQ/cli/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
* [Configuration](#configuration)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @devcycle/cli
$ dvc COMMAND
running command...
$ dvc (--version)
@devcycle/cli/2.0.1 darwin-x64 node-v16.13.2
$ dvc --help [COMMAND]
USAGE
  $ dvc COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`dvc diff [DIFF-PATTERN]`](#dvc-diff-diff-pattern)
* [`dvc help [COMMAND]`](#dvc-help-command)

## `dvc diff [DIFF-PATTERN]`

Print a diff of DevCycle variable usage between two versions of your code.

```
USAGE
  $ dvc diff [DIFF-PATTERN] [--config-path <value>] [--auth-path <value>] [--client-id <value>]
    [--client-secret <value>] [--project <value>] [--no-api] [-f <value>] [--client-name <value>] [--match-pattern
    <value>] [--var-alias <value>] [--format console|markdown]

ARGUMENTS
  DIFF-PATTERN  A "git diff"-compatible diff pattern, eg. "branch1 branch2"

FLAGS
  -f, --file=<value>          File path of existing diff file to inspect.
  --auth-path=<value>         [default: .devcycle/auth.yml] Override the default location to look for an auth.yml file
  --client-id=<value>         Client ID to use for DevCycle API Authorization
  --client-name=<value>...    Name(s) of the DevCycle client variable to match on. Accepts multiple values.
  --client-secret=<value>     Client Secret to use for DevCycle API Authorization
  --config-path=<value>       [default: .devcycle/config.yml] Override the default location to look for a config.yml
                              file
  --format=<option>           [default: console] Format to output the diff results in.
                              <options: console|markdown>
  --match-pattern=<value>...  Additional full Regex pattern to use to match variable usages in your code. Should contain
                              exactly one capture group which matches on the key of the variable. Must specify the file
                              extension to override the pattern for, eg. "--match-pattern js=<YOUR PATTERN>"
  --no-api                    Disable API-based enhancements for commands where authorization is optional. Suppresses
                              warnings about missing credentials.
  --project=<value>           Project key to use for the DevCycle API requests
  --var-alias=<value>...      Aliases to use when identifying variables in your code. Should contain a code reference
                              mapped to a DevCycle variable key, eg. "--var-alias "VARIABLES.ENABLE_V1=enable-v1"

DESCRIPTION
  Print a diff of DevCycle variable usage between two versions of your code.

EXAMPLES
  $ dvc diff

  $ dvc diff --match-pattern javascript="dvcClient\.variable\(\s*["']([^"']*)["']"
```

_See code: [dist/commands/diff/index.ts](https://github.com/DevCycleHQ/cli/blob/v2.0.1/dist/commands/diff/index.ts)_

## `dvc help [COMMAND]`

Display help for dvc.

```
USAGE
  $ dvc help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for dvc.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.10/src/commands/help.ts)_
<!-- commandsstop -->
# Configuration
Many of the options available as command-line args can also be specified using a configuration file. The default
location for this file is `<REPO ROOT>/.devcycle/config.yml`. It is also assumed that the CLI commands are run from the
root of the repository.

This location can be overridden using the `--config-path` flag.

The configuration file format is documented below:

```yml
## block for configuring "code insights" features like diff and variable usage scanning
## use this section to improve the detection of DevCycle usage within your code
codeInsights:
    ## add additional names to check for when looking for instances of DVCClient from an SDK
    clientNames:
        - "dvcClient"
    ## map the values used in your code to the corresponding variable key in DevCycle
    variableAliases:
      'VARIABLES.ENABLE_V1': 'enable-v1'
    ## fully override the regex patterns used to match variables for a specific file extension
    ## each pattern should contain exactly one capture group which matches on the key of the variable
    matchPatterns:
        ## file extension to override for, containing a list of patterns to use
        js:
            - dvcClient\.variable\(\s*["']([^"']*)["']
```
