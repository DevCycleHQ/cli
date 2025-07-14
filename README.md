DevCycle CLI
=================

DevCycle CLI for interacting with DevCycle features from the command line.

## Major Features

- **Feature Management**: Fully manage Features, Variables, Variations and Targeting Rules
- **Code Analysis**: Detect and list DevCycle Variable usages across multiple programming languages
- **Self-Targeting**: Manage Overrides to quickly switch between Variable values for testing
- **Type Generation**: Generate TypeScript definitions for type-safe DevCycle usage
- **Code Refactoring**: Replace DevCycle variables with static values using the cleanup command
- **Multi-Organization Support**: Switch between different organizations seamlessly
- **Interactive Mode**: User-friendly prompts for complex operations

## Supported Languages

The CLI can analyze code and detect DevCycle usage in:
- JavaScript/TypeScript (including React)
- Java/Kotlin (including Android)
- C#/.NET
- Python
- Ruby
- Go
- Swift/iOS
- PHP
- Dart/Flutter

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@devcycle/cli.svg)](https://www.npmjs.com/package/@devcycle/cli)
[![License](https://img.shields.io/npm/l/@devcycle/cli.svg)](https://github.com/DevCycleHQ/cli/blob/main/package.json)

<!-- toc -->
* [Setup](#setup)
* [Authentication](#authentication)
* [Usage](#usage)
* [Command Topics](#command-topics)
* [Output Formats](#output-formats)
* [Global Options](#global-options)
* [Repo Configuration](#repo-configuration)
<!-- tocstop -->
# Setup

## Install the CLI
Using NPM
```sh-session
$ npm install -g @devcycle/cli
```
Or alternatively, using homebrew

```sh-session
$ brew tap devcyclehq/cli
$ brew install devcycle
```
# Authentication
Many of the CLI commands require DevCycle API authorization. There are several ways to provide these credentials.

## Using Access Tokens (preferred)

### Login Command
By using the [`login sso` command](docs/login.md#dvc-login-sso), the CLI will retrieve and store an access token, which is valid for 24 hours.

The [`login again` command](docs/login.md#dvc-login-again) can be used to retrieve a new access token using the saved project and organization without prompting for them.

This process will open browser windows to interact with the DevCycle universal login page. It will first obtain a personal access token, then prompt you to choose an organization. A second browser window is used to authenticate the CLI with your chosen organization.

To switch organizations once logged in, the [`organizations select` command](docs/organizations.md) can be used.

If executing the CLI in a containerized environment, please ensure one of the following PORTs can be accessed via Port Forwarding: 2194 (default), 2195, 2196 or 8080. This will allow the authentication process to complete and set the access token appropriately.

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
The CLI supports authentication via environment variables, useful for CI/CD pipelines:

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
@devcycle/cli/5.21.0 darwin-arm64 node-v22.12.0
$ dvc --help [COMMAND]
USAGE
  $ dvc COMMAND
...
```
<!-- usagestop -->

# Output Formats

Many commands support different output formats for integration with other tools:

- **Console** (default): Human-readable output with formatting
- **JSON**: Machine-readable format for scripting and automation
- **Markdown**: Formatted output for documentation (diff command)

Example:
```sh-session
$ dvc usages --format=json
$ dvc diff --format=markdown
```

# Global Options

The following options are available for all commands:

- `--headless`: Disable interactive prompts, ideal for CI/CD environments
- `--no-api`: Run commands offline without API enhancements
- `--project=<key>`: Override the default project
- `--config-path=<path>`: Custom user config file location
- `--auth-path=<path>`: Custom auth file location
- `--repo-config-path=<path>`: Custom repo config file location

Example:
```sh-session
$ dvc features list --headless --project=my-project
```

<!-- commands -->
# Command Topics

* [`dvc alias`](docs/alias.md) - Manage repository variable aliases.
* [`dvc autocomplete`](docs/autocomplete.md) - Display autocomplete installation instructions
* [`dvc cleanup`](docs/cleanup.md) - Replace a DevCycle variable with a static value in the current version of your code. Currently only JavaScript is supported.
* [`dvc diff`](docs/diff.md) - Print a diff of DevCycle variable usage between two versions of your code.
* [`dvc environments`](docs/environments.md) - Create a new Environment for an existing Feature.
* [`dvc features`](docs/features.md) - Create, view, or modify Features with the Management API.
* [`dvc generate`](docs/generate.md) - Generate Devcycle related files.
* [`dvc help`](docs/help.md) - Display help for dvc.
* [`dvc identity`](docs/identity.md) - View or manage your DevCycle Identity.
* [`dvc keys`](docs/keys.md) - Retrieve SDK keys from the Management API.
* [`dvc login`](docs/login.md) - Log in to DevCycle.
* [`dvc logout`](docs/logout.md) - Discards any auth configuration that has been stored in the auth configuration file.
* [`dvc organizations`](docs/organizations.md) - List or switch organizations.
* [`dvc overrides`](docs/overrides.md) - Create, view, or modify Overrides for a Project with the Management API.
* [`dvc projects`](docs/projects.md) - Create, or view Projects with the Management API.
* [`dvc repo`](docs/repo.md) - Manage repository configuration.
* [`dvc status`](docs/status.md) - Check CLI status.
* [`dvc targeting`](docs/targeting.md) - Create, view, or modify Targeting Rules for a Feature with the Management API.
* [`dvc usages`](docs/usages.md) - Print all DevCycle variable usages in the current version of your code.
* [`dvc variables`](docs/variables.md) - Create, view, or modify Variables with the Management API.
* [`dvc variations`](docs/variations.md) - Create a new Variation for an existing Feature.

<!-- commandsstop -->

# Repo Configuration
The following commands require a configured repository:

- [`dvc diff`](docs/diff.md) - Compare variable usage between code versions
- [`dvc usages`](docs/usages.md) - Scan for variable usage
- [`dvc alias`](docs/alias.md) - Manage variable aliases
- [`dvc cleanup`](docs/cleanup.md) - Refactor code to remove variables

Configuration can be initialized using:
```sh-session
$ dvc repo init
```

Many options can be specified in the repo configuration file (default: `.devcycle/config.yml`):

```yml
## Project and organization settings
project: "project-key"
org:
  id: "org_xxxxxx"
  name: "unique-org-key"
  display_name: "Human Readable Org Name"

## Code insights configuration
codeInsights:
  ## Additional client names to detect (beyond defaults: dvcClient, devcycleClient, etc.)
  clientNames:
    - "myCustomClient"
  
  ## Map code aliases to DevCycle variable keys
  variableAliases:
    "VARIABLES.ENABLE_V1": "enable-v1"
  
  ## Custom regex patterns for variable detection by file extension
  matchPatterns:
    js:
      - dvcClient\.variable\(\s*["']([^"']*)["']
    tsx:
      - useVariable\(\s*["']([^"']*)["']
  
  ## File patterns to include/exclude in scans
  includeFiles:
    - "src/**/*.[jt]s"
  excludeFiles:
    - "dist/**"
    - "node_modules/**"
```

## Match Patterns
When identifying variable usages in the code, the CLI will identify DevCycle SDK methods by default. To capture 
other usages you may define match patterns. Match patterns are defined by file extension, and each pattern should 
contain exactly one capture group which matches the key of the variable. Make sure the captured value contains the 
entire key parameter (including quotes, if applicable).

Match patterns can be defined in the configuration file, for example:

```yml
codeInsights:
  matchPatterns:
    js:
      - customVariableGetter\(\s*["']([^"']*)["']
    ts:
      - customVariableGetter\(\s*["']([^"']*)["']
    jsx:
      - customVariableHook\(\s*["']([^"']*)["']
      - customVariableGetter\(\s*["']([^"']*)["']
    tsx:
      - customVariableHook\(\s*["']([^"']*)["']
      - customVariableGetter\(\s*["']([^"']*)["']
```

Match patterns can also be passed directly to relevant commands using the `--match-pattern` flag:
```sh-session
$ dvc usages --match-pattern ts="customVariableGetter\(\s*[\"']([^\"']*)[\"']" js="customVariableGetter\(\s*[\"']([^\"']*)[\"']"
```

When testing your regex the `--show-regex` flag can be helpful. This will print all patterns used to find matches in your codebase.
```sh-session
$ dvc usages --show-regex
```

## Interactive Mode

Many commands support an interactive mode with helpful prompts when flags are not provided:

```sh-session
# Create a feature interactively
$ dvc features create --interactive

# Select a project interactively
$ dvc projects select

# Update variables with guided prompts
$ dvc variables update
```

## CI/CD Integration

The CLI is designed to work seamlessly in CI/CD environments:

```sh-session
# Run in headless mode with all required parameters
$ dvc usages --headless --format=json --output=usages.json

# Generate TypeScript definitions in CI
$ dvc generate types --headless --output-dir=src/types

# Check for feature flag changes in PR
$ dvc diff main feature-branch --format=markdown
```

## Examples

### Quick Feature Creation
```sh-session
# Create a feature with variations and variables in one command
$ dvc features create --key=new-feature --name="New Feature" \
  --variations='[{"key":"on","name":"On"},{"key":"off","name":"Off"}]' \
  --variables='[{"key":"message","type":"String"}]'
```

### Scanning for Variable Usage
```sh-session
# Find all variable usages in your codebase
$ dvc usages

# Find unused variables
$ dvc usages --only-unused

# Export results to JSON
$ dvc usages --format=json --output=usage-report.json
```

### Managing Self-Targeting Overrides
```sh-session
# View current overrides
$ dvc overrides list

# Set an override for testing
$ dvc overrides update --feature=my-feature --environment=development

# Clear all overrides
$ dvc overrides clear
```
