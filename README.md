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
* [Command Topics](#command-topics)
* [Repo Configuration](#repo-configuration)
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
By using the [`login sso` command](docs/login.md#dvc-login-sso), the CLI will retrieve and store an access token, which is valid for 24 hours.

This process will open browser windows to interact with the DevCycle universal login page. It will first obtain a personal access token, then prompt you to choose an organization. A second browser window is used to authenticate the CLI with your chosen organization.

To switch organizations once logged in, the [org command](docs/org.md) can be used.
## Using Client Credentials
### Client Credentials in Auth File
Use the [`dvc status` command](docs/status.md#dvc-status) to find the configuration file location for your platform. The credentials can be stored in the file pointed to by the Auth config path. Create the file if it does not exist, with the following contents.

```yaml
clientCredentials:
  client_id: <your client id>
  client_secret: <your client secret>
```
This file should **not** be checked in to version control.

The default location is based on the [oclif configDir](https://oclif.io/docs/config)

If you intend to run the CLI using options that override config file locations, the [`dvc status` command](docs/status.md#dvc-status) command can be run with those options to confirm that the file locations are as expected.
## Project Selection

You also need to specify the default project ID for the CLI to use.

If there is a repo configuration file, the [`dvc diff`](docs/diff.md) and [`dvc usages`](docs/usages.md) commands will use the project defined there.

Otherwise, this is chosen during login or set using the [project select command](docs/project.md#dvc-projects-select)

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
```
### Github Action
The Devcycle Github actions are configured with auth information through the `project-key`, `client-id` and `client-secret` configuration parameters. This is passed to the CLI via command line arguments.
# Usage
<!-- usage -->
```sh-session
$ npm install -g @devcycle/cli
$ dvc COMMAND
running command...
$ dvc (--version)
@devcycle/cli/4.0.0 darwin-x64 node-v16.13.0
$ dvc --help [COMMAND]
USAGE
  $ dvc COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
# Command Topics

* [`dvc diff`](docs/diff.md) - Print a diff of DevCycle variable usage between two versions of your code.
* [`dvc features`](docs/features.md) - Access or modify Features with the Management API
* [`dvc help`](docs/help.md) - Display help for dvc.
* [`dvc login`](docs/login.md) - Log in to DevCycle
* [`dvc logout`](docs/logout.md) - Discards any auth configuration that has been stored in the auth configuration file.
* [`dvc org`](docs/org.md) - Switch organizations
* [`dvc projects`](docs/projects.md) - Access Projects with the Management API
* [`dvc status`](docs/status.md) - Check CLI status
* [`dvc usages`](docs/usages.md) - Print all DevCycle variable usages in the current version of your code.
* [`dvc variables`](docs/variables.md) - Access or modify Variables with the Management API

<!-- commandsstop -->
# Repo Configuration
It is assumed that the [`dvc diff`](docs/diff.md) and [`dvc usages`](docs/usages.md) commands are run from the root of the repository

Many of the options available as command-line args for these commands can also be specified using a repo configuration file. The default
location for this file is `<REPO ROOT>/.devcycle/config.yml`.

This location can be overridden using the `--repo-config-path` flag.

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
```

#Development
To test local changes, run `yarn build`. From there, you can run commands from the `bin` folder.
e.g. `bin/run diff origin/main...`
