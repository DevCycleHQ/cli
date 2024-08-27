`dvc autocomplete`
==================

display autocomplete installation instructions

* [`dvc autocomplete [SHELL]`](#dvc-autocomplete-shell)

## `dvc autocomplete [SHELL]`

display autocomplete installation instructions

```
USAGE
  $ dvc autocomplete [SHELL] [-r]

ARGUMENTS
  SHELL  (zsh|bash|powershell) Shell type

FLAGS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

DESCRIPTION
  display autocomplete installation instructions

EXAMPLES
  $ dvc autocomplete

  $ dvc autocomplete bash

  $ dvc autocomplete zsh

  $ dvc autocomplete powershell

  $ dvc autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v2.3.1/src/commands/autocomplete/index.ts)_
