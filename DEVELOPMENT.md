# Development

This project uses a `.nvmrc` file to automatically set the version of node being used in your shell when you cd into the
project folder. If you do not have nvm installed, you can download it [here](https://github.com/nvm-sh/nvm).
It requires some additions to your shell, instructions for which can be found [here](https://github.com/nvm-sh/nvm#bash).

To manually test local changes, run `yarn build`. From there, you can run commands from the `bin` folder.
e.g. `bin/run diff origin/main...`

To run the test suite, run `yarn test`

## Publishing a new version
- Run [CLI Release workflow](https://github.com/DevCycleHQ/cli/actions/workflows/cli-release.yml) with desired values (Default values: draft release, prerelease, npm version patch)

#### publishing manually (not preferred)
1. Run `nvm use` to set the correct node version
2. Run `yarn build`
3. Create a branch off of `main` and run `npm version patch` to bump the CLI version.
4. Create a PR for these changes.
5. Once merged, move the tag from your branch to the new commit on main, and push the tag
6. Create a new Github release using the tag for the latest version.
7. From `main`, publish to NPM `npm publish --access public`
8. Update the CLI version in the [docs repo](https://github.com/DevCycleHQ/devcycle-docs/blob/main/docusaurus.config.js#L9)
