# DevCycle CLI Coding Standards and Conventions

## Project Structure

TypeScript CLI application built with oclif framework for DevCycle feature flag management.

### Main Entry Points

- **CLI Binary**: `bin/run` - Main CLI entry point
- **MCP Server**: `dist/mcp/index.js` - Model Context Protocol server
- **Source Root**: `src/index.ts` - TypeScript entry point

### Core Directories

- `src/commands/` - All CLI commands organized by feature
- `src/api/` - API client code and schemas
- `src/auth/` - Auth handling (API keys, SSO, tokens)
- `src/ui/` - Interactive prompts and output formatting
- `src/utils/` - Shared utilities and helpers
- `src/mcp/` - Model Context Protocol implementation

## Configuration and Tooling

- Uses Yarn with workspaces
- Always use `yarn` not `npm`

## Formatting

- Defer all formatting to Prettier for supported file types (JavaScript, TypeScript, JSON, Markdown, etc.)

## Git Commit Message Conventions

- Follow Conventional Commits specification: `<type>: <description>` (scopes rarely used)
- Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- Description should be imperative mood, lowercase, single sentence
- Examples: `feat: add support for multi-threaded tests`, `fix: correct response for invalid input`

### Aviator CLI Workflow (optional)

- Use Aviator CLI (`av`) for managing stacked branches: `av branch chore-fix-invalid-input`
- Sync and push changes: `av sync --push=yes`
- Create PR: `av pr --title "<title>" --body "<body>"`
    - Title follows Conventional Commits, body uses markdown/bullets
    - `av pr` will push the branch
- GitHub PR descriptions should be short and focus on why changes were made, not what changed, limit describing files and tests changed.

## Naming Conventions

- Use camelCase for files, folders, and variables (starting with lowercase)
- PascalCase for classes and interfaces
- SCREAMING_SNAKE_CASE for constants
- kebab-case for CLI flags and file names

## TypeScript Patterns

### Type Safety

- **Never use `any` casting to fix TypeScript errors**
- Fix root cause: update type definitions, use type guards, add missing properties, use union types
- Use `unknown` instead of `any` when type is genuinely unknown
- Prefer type narrowing over type assertions

### Error Handling and Async Patterns

- Always use async/await over Promises
- Handle errors with try/catch
- Throw descriptive errors with clear messages

### Validation

- Use Zod for runtime validation
- Validate user inputs before API calls
- Provide clear validation error messages

## API Client Patterns

### Core Components

- `src/api/apiClient.ts` - Axios-based HTTP client
- `src/api/zodClient.ts` - Type-safe API client
- `src/api/schemas.ts` - Generated TypeScript types from OpenAPI spec

### Key Patterns

- All API functions are async and return typed responses
- Pass `authToken` as parameter; use `Authorization: Bearer ${token}` header
- Use axios interceptors for global error handling
- Validate responses with Zod schemas
- Use consistent parameter naming (projectKey, featureKey, etc.)
- Support pagination where applicable

## CLI Command Patterns

### Base Command Structure

All commands extend `src/commands/base.ts` which provides:

- Authentication handling: `authRequired`, `authSuggested`, `userAuthRequired`
- Configuration management: `userConfig`, `repoConfig`
- Common flags: `--project`, `--headless`, `--client-id`, `--client-secret`
- Parameter validation: `populateParameters()` and `populateParametersWithZod()`

### Command Organization

- `features/` - Feature flag management
- `variables/` - Variable management
- `targeting/` - Targeting rule management
- `projects/` - Project management
- `organizations/` - Organization management
- `auth/` - Authentication commands

### Output Formatting

- Use `this.writer` for user-facing output
- Use `this.tableOutput` for tabular data
- Support `--headless` flag for machine-readable JSON output
- Handle interactive prompts with fallbacks for headless mode

## UI Patterns

### Core Components

- `src/ui/writer.ts` - Output formatting and user messages
- `src/ui/prompts/` - Interactive user input
- `src/ui/tableOutput.ts` - Tabular data display

### Interactive Prompts

Use `promptFor()` from `src/ui/prompts` for user input:

- `type: 'input'` - Text input
- `type: 'list'` - Selection from choices
- `type: 'autocomplete'` - Searchable selection

### Headless Mode Support

Check `flags.headless` to output machine-readable JSON instead of interactive prompts

## Testing Patterns

### Test Framework

- Test runner: Vitest
- CLI testing: @oclif/test utilities
- HTTP mocking: nock for API mocking
- Custom wrapper: `test-utils/dvcTest.ts`

### Test Structure

Use `dvcTest()` wrapper with chained methods:

- `.nock(BASE_URL, (api) => ...)` - Mock API calls
- `.stdout()` / `.stderr()` - Capture output
- `.command([...])` - Run command with args
- `.it('description', (ctx) => ...)` - Test assertion

### Mock Data and Organization

- Create reusable mock objects with realistic data structures
- Store snapshots in `__snapshots__/` directories
- Update with `yarn test:update-snapshots`
- Group related tests in `describe` blocks
- Test both success and error cases

## MCP Tool Patterns

MCP tools without parameters should use empty properties in `inputSchema` (not dummy parameters) and pass `null` to `executeWithLogging()`.
