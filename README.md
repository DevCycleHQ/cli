oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @devcycle/cli
$ dvc COMMAND
running command...
$ dvc (--version)
@devcycle/cli/0.0.0 darwin-x64 node-v16.13.0
$ dvc --help [COMMAND]
USAGE
  $ dvc COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`dvc help [COMMAND]`](#dvc-help-command)
* [`dvc plugins`](#dvc-plugins)
* [`dvc plugins:inspect PLUGIN...`](#dvc-pluginsinspect-plugin)
* [`dvc plugins:install PLUGIN...`](#dvc-pluginsinstall-plugin)
* [`dvc plugins:link PLUGIN`](#dvc-pluginslink-plugin)
* [`dvc plugins:uninstall PLUGIN...`](#dvc-pluginsuninstall-plugin)
* [`dvc plugins update`](#dvc-plugins-update)

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

## `dvc plugins`

List installed plugins.

```
USAGE
  $ dvc plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ dvc plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.11/src/commands/plugins/index.ts)_

## `dvc plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ dvc plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ dvc plugins:inspect myplugin
```

## `dvc plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ dvc plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ dvc plugins add

EXAMPLES
  $ dvc plugins:install myplugin 

  $ dvc plugins:install https://github.com/someuser/someplugin

  $ dvc plugins:install someuser/someplugin
```

## `dvc plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ dvc plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ dvc plugins:link myplugin
```

## `dvc plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ dvc plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ dvc plugins unlink
  $ dvc plugins remove
```

## `dvc plugins update`

Update installed plugins.

```
USAGE
  $ dvc plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->
