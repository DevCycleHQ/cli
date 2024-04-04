`dvc targeting`
===============

Create, view, or modify Targeting Rules for a Feature with the Management API.

* [`dvc targeting disable [FEATURE] [ENVIRONMENT]`](#dvc-targeting-disable-feature-environment)
* [`dvc targeting enable [FEATURE] [ENVIRONMENT]`](#dvc-targeting-enable-feature-environment)
* [`dvc targeting get [FEATURE] [ENVIRONMENT]`](#dvc-targeting-get-feature-environment)
* [`dvc targeting update [FEATURE] [ENVIRONMENT]`](#dvc-targeting-update-feature-environment)

## `dvc targeting disable [FEATURE] [ENVIRONMENT]`

Disable the Targeting for the specified Environment on a Feature

```
USAGE
  $ dvc targeting disable [FEATURE] [ENVIRONMENT] [--config-path <value>] [--auth-path <value>] [--repo-config-path
    <value>] [--client-id <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless]

ARGUMENTS
  FEATURE      The Feature for the Targeting Rules
  ENVIRONMENT  The Environment where the Targeting Rules will be enabled

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
  Disable the Targeting for the specified Environment on a Feature

EXAMPLES
  $ dvc targeting disable feature-one environment-one
```

_See code: [src/commands/targeting/disable.ts](https://github.com/DevCycleHQ/cli/blob/v5.14.5/src/commands/targeting/disable.ts)_

## `dvc targeting enable [FEATURE] [ENVIRONMENT]`

Enable the Targeting for the specified Environment on a Feature

```
USAGE
  $ dvc targeting enable [FEATURE] [ENVIRONMENT] [--config-path <value>] [--auth-path <value>] [--repo-config-path
    <value>] [--client-id <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless]

ARGUMENTS
  FEATURE      The Feature for the Targeting Rules
  ENVIRONMENT  The Environment where the Targeting Rules will be enabled

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
  Enable the Targeting for the specified Environment on a Feature

EXAMPLES
  $ dvc targeting enable feature-one environment-one
```

_See code: [src/commands/targeting/enable.ts](https://github.com/DevCycleHQ/cli/blob/v5.14.5/src/commands/targeting/enable.ts)_

## `dvc targeting get [FEATURE] [ENVIRONMENT]`

Retrieve Targeting for a Feature from the Management API

```
USAGE
  $ dvc targeting get [FEATURE] [ENVIRONMENT] [--config-path <value>] [--auth-path <value>] [--repo-config-path
    <value>] [--client-id <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless]

ARGUMENTS
  FEATURE      The Feature to get the Targeting Rules
  ENVIRONMENT  The Environment to get the Targeting Rules

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
  Retrieve Targeting for a Feature from the Management API

EXAMPLES
  $ dvc targeting get feature-one

  $ dvc targeting get feature-one environment-one
```

_See code: [src/commands/targeting/get.ts](https://github.com/DevCycleHQ/cli/blob/v5.14.5/src/commands/targeting/get.ts)_

## `dvc targeting update [FEATURE] [ENVIRONMENT]`

Update Targeting rules for a Feature. The definition is the audience for the feature, while serve is the key of the variation to serve to the audience.

```
USAGE
  $ dvc targeting update [FEATURE] [ENVIRONMENT] [--config-path <value>] [--auth-path <value>] [--repo-config-path
    <value>] [--client-id <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--targets
    <value>] [--status enable|disable]

ARGUMENTS
  FEATURE      The Feature for the Targeting Rule.
  ENVIRONMENT  The Environment where the Targeting Rule will be updated.

FLAGS
  --status=<option>  The status to set the targeting rule to.
                     <options: enable|disable>
  --targets=<value>  List of targeting rules.

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
  Update Targeting rules for a Feature. The definition is the audience for the feature, while serve is the key of the
  variation to serve to the audience.
```

_See code: [src/commands/targeting/update.ts](https://github.com/DevCycleHQ/cli/blob/v5.14.5/src/commands/targeting/update.ts)_
