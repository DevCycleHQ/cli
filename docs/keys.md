`dvc keys`
==========

Retrieve SDK keys from the management API

* [`dvc keys get`](#dvc-keys-get)

## `dvc keys get`

Retrieve SDK keys from the management API

```
USAGE
  $ dvc keys get [--config-path <value>] [--auth-path <value>] [--repo-config-path <value>] [--client-id
    <value>] [--client-secret <value>] [--project <value>] [--no-api] [--headless] [--env <value>] [--type
    mobile|client|server]

FLAGS
  --env=<value>    Environment to fetch a key for
  --type=<option>  The type of SDK key to retrieve
                   <options: mobile|client|server>

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
  Retrieve SDK keys from the management API

EXAMPLES
  $ dvc keys get

  $ dvc keys get --keys=environment-one,environment-two
```
