DevCycle CLI
=================

DevCycle CLI for interacting with DevCycle features from the command line.

The CLI can be customized in several ways using command-line args or by creating a [configuration file](#configuration).

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@devcycle/cli.svg)](https://www.npmjs.com/package/@devcycle/cli)
[![License](https://img.shields.io/npm/l/@devcycle/cli.svg)](https://github.com/DevCycleHQ/cli/blob/main/package.json)

<!-- toc -->
* [Setup](#setup)
* [Authentication](#authentication)
* [Usage](#usage)
* [Commands](#commands)
* [Configuration](#configuration)
<!-- tocstop -->
# Setup
## Install the CLI:
```sh-session
$ npm install -g @devcycle/cli
```
# Authentication
Many of the CLI commands require DevCycle API authorization. There are several ways to provide these credentials.
## Using Access Tokens
### Login Command (preferred)
By using the [login sso command](docs/login.md#dvc-login-sso), the CLI will retrieve and store an access token, which is valid for 24 hours.

This process will open browser windows to interact with the DevCycle universal login page. It will first obtain a personal access token, then prompt you to choose an organization. A second browser window is used to authenticate the CLI with your chosen organization.

To switch organizations once logged in, the [org command](docs/org.md) can be used.
## Using Client Credentials
### Credentials File
Create a subdirectory inside the directory where you're running the CLI called `.devcycle`, then inside that directory
create an `auth.yml` file with the following contents:

```yaml
clientCredentials:
  client_id: <your client id>
  client_secret: <your client secret>
```
This file should **not** be checked in to version control.

You also need to specify the default project ID for the CLI to use. 

This can be set using the [project select command](docs/project.md#dvc-projects-select) or by manually updating the [configuration](#configuration) file:
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
@devcycle/cli/3.0.1 darwin-x64 node-v16.13.0
$ dvc --help [COMMAND]
USAGE
  $ dvc COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`dvc diff [DIFF-PATTERN]`](#dvc-diff-diff-pattern)
* [`dvc features get`](#dvc-features-get)
* [`dvc features list`](#dvc-features-list)
* [`dvc help [COMMAND]`](#dvc-help-command)
* [`dvc login sso`](#dvc-login-sso)
* [`dvc logout`](#dvc-logout)
* [`dvc org`](#dvc-org)
* [`dvc projects select`](#dvc-projects-select)
* [`dvc usages`](#dvc-usages)
* [`dvc variables create`](#dvc-variables-create)
* [`dvc variables get`](#dvc-variables-get)
* [`dvc variables list`](#dvc-variables-list)
* [`dvc variables update`](#dvc-variables-update)

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
  --client-name=<value>...    Name(s) of the DevCycle client variable to match on. Accepts multiple values.
  --format=<option>           [default: console] Format to use when outputting the diff results.
                              <options: console|markdown>
  --match-pattern=<value>...  Additional full Regex pattern to use to match variable usages in your code. Should contain
                              exactly one capture group which matches on the key of the variable. Must specify the file
                              extension to override the pattern for, eg. "--match-pattern js=<YOUR PATTERN>"
  --show-regex                Output the regex pattern used to find variable usage
  --var-alias=<value>...      Aliases to use when identifying variables in your code. Should contain a code reference
                              mapped to a DevCycle variable key, eg. "--var-alias "VARIABLES.ENABLE_V1=enable-v1"

GLOBAL FLAGS
  --auth-path=<value>      Override the default location to look for an auth.yml file
  --client-id=<value>      Client ID to use for DevCycle API Authorization
  --client-secret=<value>  Client Secret to use for DevCycle API Authorization
  --config-path=<value>    Override the default location to look for a config.yml file
  --no-api                 Disable API-based enhancements for commands where authorization is optional. Suppresses
                           warnings about missing credentials.
  --project=<value>        Project key to use for the DevCycle API requests

DESCRIPTION
  Print a diff of DevCycle variable usage between two versions of your code.

EXAMPLES
  $ dvc diff

  $ dvc diff --match-pattern javascript="dvcClient\.variable\(\s*["']([^"']*)["']"
```

_See code: [dist/commands/diff/index.ts](https://github.com/DevCycleHQ/cli/blob/v3.0.1/dist/commands/diff/index.ts)_

## `dvc features get`

Retrieve Features from the management API

```
USAGE
  $ dvc features get [--config-path <value>] [--auth-path <value>] [--client-id <value>] [--client-secret <value>]
    [--project <value>] [--no-api] [--keys <value>]

FLAGS
  --keys=<value>  Comma-separated list of feature keys to fetch details for

GLOBAL FLAGS
  --auth-path=<value>      Override the default location to look for an auth.yml file
  --client-id=<value>      Client ID to use for DevCycle API Authorization
  --client-secret=<value>  Client Secret to use for DevCycle API Authorization
  --config-path=<value>    Override the default location to look for a config.yml file
  --no-api                 Disable API-based enhancements for commands where authorization is optional. Suppresses
                           warnings about missing credentials.
  --project=<value>        Project key to use for the DevCycle API requests

DESCRIPTION
  Retrieve Features from the management API

EXAMPLES
  $ dvc features get

  $ dvc features get --keys=feature-one,feature-two
```

## `dvc features list`

```
USAGE
  $ dvc features list [--config-path <value>] [--auth-path <value>] [--client-id <value>] [--client-secret <value>]
    [--project <value>] [--no-api]

GLOBAL FLAGS
  --auth-path=<value>      Override the default location to look for an auth.yml file
  --client-id=<value>      Client ID to use for DevCycle API Authorization
  --client-secret=<value>  Client Secret to use for DevCycle API Authorization
  --config-path=<value>    Override the default location to look for a config.yml file
  --no-api                 Disable API-based enhancements for commands where authorization is optional. Suppresses
                           warnings about missing credentials.
  --project=<value>        Project key to use for the DevCycle API requests
```

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

## `dvc login sso`

Log in through the DevCycle Universal Login. This will open a browser window

```
USAGE
  $ dvc login sso [--config-path <value>] [--auth-path <value>] [--client-id <value>] [--client-secret <value>]
    [--project <value>] [--no-api]

GLOBAL FLAGS
  --auth-path=<value>      Override the default location to look for an auth.yml file
  --client-id=<value>      Client ID to use for DevCycle API Authorization
  --client-secret=<value>  Client Secret to use for DevCycle API Authorization
  --config-path=<value>    Override the default location to look for a config.yml file
  --no-api                 Disable API-based enhancements for commands where authorization is optional. Suppresses
                           warnings about missing credentials.
  --project=<value>        Project key to use for the DevCycle API requests

DESCRIPTION
  Log in through the DevCycle Universal Login. This will open a browser window
```

## `dvc logout`

Discards any auth configuration that has been stored in the auth configuration file.

```
USAGE
  $ dvc logout [--config-path <value>] [--auth-path <value>] [--client-id <value>] [--client-secret <value>]
    [--project <value>] [--no-api]

GLOBAL FLAGS
  --auth-path=<value>      Override the default location to look for an auth.yml file
  --client-id=<value>      Client ID to use for DevCycle API Authorization
  --client-secret=<value>  Client Secret to use for DevCycle API Authorization
  --config-path=<value>    Override the default location to look for a config.yml file
  --no-api                 Disable API-based enhancements for commands where authorization is optional. Suppresses
                           warnings about missing credentials.
  --project=<value>        Project key to use for the DevCycle API requests

DESCRIPTION
  Discards any auth configuration that has been stored in the auth configuration file.
```

_See code: [dist/commands/logout/index.ts](https://github.com/DevCycleHQ/cli/blob/v3.0.1/dist/commands/logout/index.ts)_

## `dvc org`

Select which organization to access through the API

```
USAGE
  $ dvc org [--config-path <value>] [--auth-path <value>] [--client-id <value>] [--client-secret <value>]
    [--project <value>] [--no-api]

GLOBAL FLAGS
  --auth-path=<value>      Override the default location to look for an auth.yml file
  --client-id=<value>      Client ID to use for DevCycle API Authorization
  --client-secret=<value>  Client Secret to use for DevCycle API Authorization
  --config-path=<value>    Override the default location to look for a config.yml file
  --no-api                 Disable API-based enhancements for commands where authorization is optional. Suppresses
                           warnings about missing credentials.
  --project=<value>        Project key to use for the DevCycle API requests

DESCRIPTION
  Select which organization to access through the API
```

_See code: [dist/commands/org/index.ts](https://github.com/DevCycleHQ/cli/blob/v3.0.1/dist/commands/org/index.ts)_

## `dvc projects select`

```
USAGE
  $ dvc projects select [--config-path <value>] [--auth-path <value>] [--client-id <value>] [--client-secret <value>]
    [--project <value>] [--no-api]

GLOBAL FLAGS
  --auth-path=<value>      Override the default location to look for an auth.yml file
  --client-id=<value>      Client ID to use for DevCycle API Authorization
  --client-secret=<value>  Client Secret to use for DevCycle API Authorization
  --config-path=<value>    Override the default location to look for a config.yml file
  --no-api                 Disable API-based enhancements for commands where authorization is optional. Suppresses
                           warnings about missing credentials.
  --project=<value>        Project key to use for the DevCycle API requests
```

## `dvc usages`

Print all DevCycle variable usages in the current version of your code.

```
USAGE
  $ dvc usages [--config-path <value>] [--auth-path <value>] [--client-id <value>] [--client-secret <value>]
    [--project <value>] [--no-api] [--include <value>] [--exclude <value>] [--client-name <value>] [--match-pattern
    <value>] [--var-alias <value>] [--format console|json] [--show-regex]

FLAGS
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
  --show-regex                Output the regex pattern used to find variable usage
  --var-alias=<value>...      Aliases to use when identifying variables in your code. Should contain a code reference
                              mapped to a DevCycle variable key, eg. "--var-alias "VARIABLES.ENABLE_V1=enable-v1"

GLOBAL FLAGS
  --auth-path=<value>      Override the default location to look for an auth.yml file
  --client-id=<value>      Client ID to use for DevCycle API Authorization
  --client-secret=<value>  Client Secret to use for DevCycle API Authorization
  --config-path=<value>    Override the default location to look for a config.yml file
  --no-api                 Disable API-based enhancements for commands where authorization is optional. Suppresses
                           warnings about missing credentials.
  --project=<value>        Project key to use for the DevCycle API requests

DESCRIPTION
  Print all DevCycle variable usages in the current version of your code.

EXAMPLES
  $ dvc usages

  $ dvc usages --match-pattern javascript="dvcClient\.variable\(\s*["']([^"']*)["']"
```

_See code: [dist/commands/usages/index.ts](https://github.com/DevCycleHQ/cli/blob/v3.0.1/dist/commands/usages/index.ts)_

## `dvc variables create`

Create a new Variable for an existing Feature.

```
USAGE
  $ dvc variables create [--config-path <value>] [--auth-path <value>] [--client-id <value>] [--client-secret <value>]
    [--project <value>] [--no-api]

GLOBAL FLAGS
  --auth-path=<value>      Override the default location to look for an auth.yml file
  --client-id=<value>      Client ID to use for DevCycle API Authorization
  --client-secret=<value>  Client Secret to use for DevCycle API Authorization
  --config-path=<value>    Override the default location to look for a config.yml file
  --no-api                 Disable API-based enhancements for commands where authorization is optional. Suppresses
                           warnings about missing credentials.
  --project=<value>        Project key to use for the DevCycle API requests

DESCRIPTION
  Create a new Variable for an existing Feature.
```

## `dvc variables get`

```
USAGE
  $ dvc variables get [--config-path <value>] [--auth-path <value>] [--client-id <value>] [--client-secret <value>]
    [--project <value>] [--no-api] [--keys <value>]

FLAGS
  --keys=<value>  Comma-separated list of variable keys to fetch details for

GLOBAL FLAGS
  --auth-path=<value>      Override the default location to look for an auth.yml file
  --client-id=<value>      Client ID to use for DevCycle API Authorization
  --client-secret=<value>  Client Secret to use for DevCycle API Authorization
  --config-path=<value>    Override the default location to look for a config.yml file
  --no-api                 Disable API-based enhancements for commands where authorization is optional. Suppresses
                           warnings about missing credentials.
  --project=<value>        Project key to use for the DevCycle API requests
```

## `dvc variables list`

```
USAGE
  $ dvc variables list [--config-path <value>] [--auth-path <value>] [--client-id <value>] [--client-secret <value>]
    [--project <value>] [--no-api]

GLOBAL FLAGS
  --auth-path=<value>      Override the default location to look for an auth.yml file
  --client-id=<value>      Client ID to use for DevCycle API Authorization
  --client-secret=<value>  Client Secret to use for DevCycle API Authorization
  --config-path=<value>    Override the default location to look for a config.yml file
  --no-api                 Disable API-based enhancements for commands where authorization is optional. Suppresses
                           warnings about missing credentials.
  --project=<value>        Project key to use for the DevCycle API requests
```

## `dvc variables update`

Update a Variable.

```
USAGE
  $ dvc variables update [--config-path <value>] [--auth-path <value>] [--client-id <value>] [--client-secret <value>]
    [--project <value>] [--no-api]

GLOBAL FLAGS
  --auth-path=<value>      Override the default location to look for an auth.yml file
  --client-id=<value>      Client ID to use for DevCycle API Authorization
  --client-secret=<value>  Client Secret to use for DevCycle API Authorization
  --config-path=<value>    Override the default location to look for a config.yml file
  --no-api                 Disable API-based enhancements for commands where authorization is optional. Suppresses
                           warnings about missing credentials.
  --project=<value>        Project key to use for the DevCycle API requests

DESCRIPTION
  Update a Variable.
```
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
    ## make sure the captured value contains the entire key parameter (including quotes, if applicable)
    matchPatterns:
        ## file extension to override for, containing a list of patterns to use
        js:
            - dvcClient\.variable\(\s*["']([^"']*)["']
    ## an array of file glob patterns to include in usage scan
    includeFiles:
        - '*.[jt]s'
    ## an array of file glob patterns to exclude from usage scan
    excludeFiles:
        - 'dist/*'
## the default project key to use for commands that interact with the DevCycle API.
project: my-project
```

#Development
To test local changes, run `yarn build`. From there, you can run commands from the `bin` folder.
e.g. `bin/run diff origin/main...`
