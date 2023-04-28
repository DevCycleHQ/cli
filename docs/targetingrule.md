`dvc targetingrule`
===================

Create a new Environment for an existing Feature.

* [`dvc targetingrule create`](#dvc-targetingrule-create)
* [`dvc targetingrule list`](#dvc-targetingrule-list)
* [`dvc targetingrule toggle`](#dvc-targetingrule-toggle)

## `dvc targetingrule create`

Create a new Environment for an existing Feature.

```
USAGE
  $ dvc targetingrule create [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--featureKey <value>]
    [--environmentKey <value>] [--variationKey <value>]

FLAGS
  --environmentKey=<value>  environment key for the targeting rule to create for
  --featureKey=<value>      feature key for the targeting rule to create for
  --variationKey=<value>    variation key for the targeting rule to create for

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
  Create a new Environment for an existing Feature.
```

## `dvc targetingrule list`

Create a new Environment for an existing Feature.

```
USAGE
  $ dvc targetingrule list [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
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
  Create a new Environment for an existing Feature.
```

## `dvc targetingrule toggle`

Create a new Environment for an existing Feature.

```
USAGE
  $ dvc targetingrule toggle [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--featureKey <value>]
    [--environmentKey <value>] [--on] [--off]

FLAGS
  --environmentKey=<value>  environment key for the targeting rule to create for
  --featureKey=<value>      feature key for the targeting rule to create for
  --off                     toggle off the targeting rule
  --on                      toggle on the targeting rule

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
  Create a new Environment for an existing Feature.
```
