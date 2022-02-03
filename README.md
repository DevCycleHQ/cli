DevCycle CLI
=================

DevCycle CLI for interacting with DevCycle features from the command line.

The CLI can be customized in several ways using command-line args or by creating a [configuration file](#configuration).

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@devcycle/cli.svg)](https://www.npmjs.com/package/@devcycle/cli)
[![License](https://img.shields.io/npm/l/@devcycle/cli.svg)](https://github.com/DevCycleHQ/cli/blob/main/package.json)

<!-- toc -->
* [Setup](#setup)
* [Usage](#usage)
* [Commands](#commands)
* [Configuration](#configuration)
* [Development](#development)
<!-- tocstop -->
# Setup
## Install the CLI:
```sh-session
$ npm install -g @devcycle/cli
```
## Set up DevCycle API Credentials
Many of the CLI commands require DevCycle API authorization. Your DevCycle organization's client ID and secret must
be provided. They can be obtained from the [settings page](https://app.devcycle.com/settings) of the DevCycle dashboard.

There are several ways to provide these credentials:
### Credentials File
Create a subdirectory inside the directory where you're running the CLI called `.devcycle`, then inside that directory
create an `auth.yml` file with the following contents:

```yaml
client_id: <your client id>
client_secret: <your client secret>
```
This file should **not** be checked in to version control.

You also need to specify the default project ID for the CLI to use. This can be set in the [configuration](#configuration) file:
```yaml
project: <your project id>
```

### Environment Variables
Set the following environment variables:
```sh-session
$ export DVC_CLIENT_ID=<your client id>
$ export DVC_CLIENT_SECRET=<your client secret>
$ export DVC_PROJECT_KEY=<your project key>
```
### Command-Line Arguments
The CLI can be run with the following arguments:
```sh-session
$ dvc --client-id=<your client id> --client-secret=<your client secret> --project=<your project key>

# Usage
<!-- usage -->
```sh-session
$ npm install -g @devcycle/cli
$ dvc COMMAND
running command...
$ dvc (--version)
@devcycle/cli/2.0.2 darwin-x64 node-v16.13.2
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
    <value>] [--var-alias <value>] [--format console|markdown] [--show-regex]

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
  --show-regex                Output the regex pattern used to find variable usage
  --var-alias=<value>...      Aliases to use when identifying variables in your code. Should contain a code reference
                              mapped to a DevCycle variable key, eg. "--var-alias "VARIABLES.ENABLE_V1=enable-v1"

DESCRIPTION
  Print a diff of DevCycle variable usage between two versions of your code.

EXAMPLES
  $ dvc diff

  $ dvc diff --match-pattern javascript="dvcClient\.variable\(\s*["']([^"']*)["']"
```

_See code: [dist/commands/diff/index.ts](https://github.com/DevCycleHQ/cli/blob/v2.0.2/dist/commands/diff/index.ts)_

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
## the default project key to use for commands that interact with the DevCycle API.
project: my-project
```

# Development

## Publishing a new version
1. Checkout the latest `main` branch and bump the CLI version, `npm version patch`. Make note of the tag created.
2. Push the tag and version commit that were created, `git push && git push origin vX.X.X`
3. Publish to NPM, `npm publish --access public`
