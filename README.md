DevCycle CLI
=================

DevCycle CLI for interacting with DevCycle features from the command line.

The CLI can be customized in several ways using command-line args or by creating a [configuration file](#repo-configuration).

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@devcycle/cli.svg)](https://www.npmjs.com/package/@devcycle/cli)
[![License](https://img.shields.io/npm/l/@devcycle/cli.svg)](https://github.com/DevCycleHQ/cli/blob/main/package.json)

<!-- toc -->
* [Setup](#setup)
* [Authentication](#authentication)
* [Usage](#usage)
* [Command Topics](#command-topics)
* [Repo Configuration](#repo-configuration)
<!-- tocstop -->
# Setup

## Install the CLI
```sh-session
$ npm install -g @devcycle/cli
```
# Authentication
Many of the CLI commands require DevCycle API authorization. There are several ways to provide these credentials.

## Using Access Tokens (preferred)

### Login Command
By using the [`login sso` command](docs/login.md#dvc-login-sso), the CLI will retrieve and store an access token, which is valid for 24 hours.

The [`login again` command](docs/login.md#dvc-login-again) can be used to retrieve a new access token using the saved project and organization without prompting for them.

This process will open browser windows to interact with the DevCycle universal login page. It will first obtain a personal access token, then prompt you to choose an organization. A second browser window is used to authenticate the CLI with your chosen organization.

To switch organizations once logged in, the [`organizations select` command](docs/organizations.md) can be used.

### Repo Init Command
The [`repo init` command](docs/repo.md#dvc-repo-init) behaves in the same way as `login sso`, but creates a [repo configuration file](#repo-configuration) and stores the project and organization choices there instead.

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

Otherwise, this is chosen during login or set using the [project select command](docs/projects.md#dvc-projects-select)

## Environment Variables
Set the following environment variables:

```sh-session
$ export DEVCYCLE_CLIENT_ID=<your client id>
$ export DEVCYCLE_CLIENT_SECRET=<your client secret>
$ export DEVCYCLE_PROJECT_KEY=<your project key>
```

## Command-Line Arguments

The CLI can be run with the following arguments:

```sh-session
$ dvc --client-id=<your client id> --client-secret=<your client secret> --project=<your project key>
```

## Github Action

The Devcycle Github actions are configured with auth information through the `project-key`, `client-id` and `client-secret` configuration parameters. This is passed to the CLI via command line arguments.

# Usage

<!-- usage -->
```sh-session
$ npm install -g @devcycle/cli
$ dvc COMMAND
running command...
$ dvc (--version)
@devcycle/cli/5.0.2 linux-x64 node-v18.16.0
$ dvc --help [COMMAND]
USAGE
  $ dvc COMMAND
...
```
<!-- usagestop -->

<!-- commands -->
# Command Topics

* [`dvc alias`](docs/alias.md) - Manage repository variable aliases.
* [`dvc autocomplete`](docs/autocomplete.md) - display autocomplete installation instructions
* [`dvc cleanup`](docs/cleanup.md) - Replace a DevCycle variable with a static value in the current version of your code. Currently only JavaScript is supported.
* [`dvc diff`](docs/diff.md) - Print a diff of DevCycle variable usage between two versions of your code.
* [`dvc environments`](docs/environments.md) - Create a new Environment for an existing Feature.
* [`dvc features`](docs/features.md) - Create, view, or modify Features with the Management API.
* [`dvc generate`](docs/generate.md) - Generate Devcycle related files.
* [`dvc help`](docs/help.md) - Display help for dvc.
* [`dvc keys`](docs/keys.md) - Retrieve SDK keys from the Management API.
* [`dvc login`](docs/login.md) - Log in to DevCycle.
* [`dvc logout`](docs/logout.md) - Discards any auth configuration that has been stored in the auth configuration file.
* [`dvc organizations`](docs/organizations.md) - List or switch organizations.
* [`dvc projects`](docs/projects.md) - Create, or view Projects with the Management API.
* [`dvc repo`](docs/repo.md) - Manage repository configuration.
* [`dvc status`](docs/status.md) - Check CLI status.
* [`dvc targeting`](docs/targeting.md) - Create, view, or modify Targeting Rules for a Feature with the Management API.
* [`dvc usages`](docs/usages.md) - Print all DevCycle variable usages in the current version of your code.
* [`dvc variables`](docs/variables.md) - Create, view, or modify Variables with the Management API.
* [`dvc variations`](docs/variations.md) - Create a new Variation for an existing Feature.

<!-- commandsstop -->

# Repo Configuration
The following commands can only be run from the root of a configured repository

- [`dvc diff`](docs/diff.md)
- [`dvc usages`](docs/usages.md)
- [`dvc alias`](docs/alias.md)
- [`dvc cleanup`](docs/cleanup.md)

Many of the options available as command-line args can also be specified using a repo configuration file. The default
location for this file is `<REPO ROOT>/.devcycle/config.yml`.

This location can be overridden using the `--repo-config-path` flag.

The configuration file format is documented below:

```yml
## the project and organization to use when connecting to the DevCycle Rest API for this repo
project: "project-key"
org:
  id: "org_xxxxxx"
  name: "unique-org-key"
  display_name: "Human Readable Org Name"
## block for configuring "code insights" features like diff and variable usage scanning
## use this section to improve the detection of DevCycle usage within your code
codeInsights:
  ## add additional names to check for when looking for instances of DVCClient from an SDK
  clientNames:
    - "dvcClient"
  ## map the values used in your code to the corresponding variable key in DevCycle
  variableAliases:
    "VARIABLES.ENABLE_V1": "enable-v1"
  ## fully override the regex patterns used to match variables for a specific file extension
  ## each pattern should contain exactly one capture group which matches on the key of the variable
  ## make sure the captured value contains the entire key parameter (including quotes, if applicable)
  matchPatterns:
    ## file extension to override for, containing a list of patterns to use
    js:
      - dvcClient\.variable\(\s*["']([^"']*)["']
  ## an array of file glob patterns to include in usage scan
  includeFiles:
    - "*.[jt]s"
  ## an array of file glob patterns to exclude from usage scan
  excludeFiles:
    - "dist/*"
```
