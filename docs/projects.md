`dvc projects`
==============

Create, or view Projects with the Management API.

* [`dvc projects create`](#dvc-projects-create)
* [`dvc projects current`](#dvc-projects-current)
* [`dvc projects get`](#dvc-projects-get)
* [`dvc projects list`](#dvc-projects-list)
* [`dvc projects ls`](#dvc-projects-ls)
* [`dvc projects select`](#dvc-projects-select)

## `dvc projects create`

Create a new Project

```
USAGE
  $ dvc projects create [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--key <value>] [--name <value>]
    [--description <value>]

FLAGS
  --description=<value>  Description for the dashboard
  --key=<value>          Unique ID
  --name=<value>         Human readable name

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
  Create a new Project
```

_See code: [src/commands/projects/create.ts](https://github.com/DevCycleHQ/cli/blob/v5.14.1/src/commands/projects/create.ts)_

## `dvc projects current`

View currently selected project

```
USAGE
  $ dvc projects current [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless]

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
  View currently selected project
```

_See code: [src/commands/projects/current.ts](https://github.com/DevCycleHQ/cli/blob/v5.14.1/src/commands/projects/current.ts)_

## `dvc projects get`

Retrieve all projects in the current Organization

```
USAGE
  $ dvc projects get [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--sortBy
    key|name|updatedAt|createdAt] [--sortOrder asc|desc]

FLAGS
  --sortBy=<option>     Sort By
                        <options: key|name|updatedAt|createdAt>
  --sortOrder=<option>  Sort Order
                        <options: asc|desc>

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
  Retrieve all projects in the current Organization
```

_See code: [src/commands/projects/get.ts](https://github.com/DevCycleHQ/cli/blob/v5.14.1/src/commands/projects/get.ts)_

## `dvc projects list`

List the keys of all projects in the current Organization

```
USAGE
  $ dvc projects list [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless]

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
  List the keys of all projects in the current Organization

ALIASES
  $ dvc projects ls
```

_See code: [src/commands/projects/list.ts](https://github.com/DevCycleHQ/cli/blob/v5.14.1/src/commands/projects/list.ts)_

## `dvc projects ls`

List the keys of all projects in the current Organization

```
USAGE
  $ dvc projects ls [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless]

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
  List the keys of all projects in the current Organization

ALIASES
  $ dvc projects ls
```

## `dvc projects select`

Select which project to access through the API

```
USAGE
  $ dvc projects select [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--org <value>]

FLAGS
  --org=<value>  The name or ID of the org to sign into

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
  Select which project to access through the API
```

_See code: [src/commands/projects/select.ts](https://github.com/DevCycleHQ/cli/blob/v5.14.1/src/commands/projects/select.ts)_
