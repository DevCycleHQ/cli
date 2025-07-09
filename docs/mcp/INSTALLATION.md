# DevCycle MCP Server Installation Guide

## Overview

The DevCycle MCP (Model Context Protocol) server provides seamless integration with AI coding assistants like Cursor and Claude Desktop, enabling natural language interactions with your DevCycle feature flags, environments, projects, and variables.

## Quick Start

### Prerequisites

- Node.js 16.0.0 or higher
- DevCycle account with API access
- Either:
  - DevCycle CLI installed and authenticated (`npm install -g @devcycle/cli`)
  - Or environment variables for authentication

### Installation

Install the DevCycle CLI (which includes the MCP server):

```bash
npm install -g @devcycle/cli
```

The MCP server is automatically available as `dvc-mcp` after installation.

## Configuration

### Authentication Methods

The MCP server supports multiple authentication methods (in order of precedence):

#### 1. Environment Variables (Recommended)
```bash
export DEVCYCLE_CLIENT_ID="your-client-id"
export DEVCYCLE_CLIENT_SECRET="your-client-secret"
export DEVCYCLE_PROJECT_KEY="your-project-key"  # Optional
```

#### 2. CLI Authentication
```bash
dvc login sso
dvc projects select your-project-key
```

#### 3. Configuration Files
The server will automatically read from:
- Repository config: `.devcycle/config.yml`
- User config: `~/.config/devcycle/user.yml`

### MCP Client Configuration

#### Cursor IDE

Add the following to your Cursor settings (`.cursor/settings.json`):

```json
{
  "mcp": {
    "servers": {
      "devcycle": {
        "command": "dvc-mcp",
        "args": [],
        "env": {
          "DEVCYCLE_CLIENT_ID": "your-client-id",
          "DEVCYCLE_CLIENT_SECRET": "your-client-secret",
          "DEVCYCLE_PROJECT_KEY": "your-project-key"
        }
      }
    }
  }
}
```

#### Claude Desktop

Add the following to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "devcycle": {
      "command": "dvc-mcp",
      "args": [],
      "env": {
        "DEVCYCLE_CLIENT_ID": "your-client-id",
        "DEVCYCLE_CLIENT_SECRET": "your-client-secret",
        "DEVCYCLE_PROJECT_KEY": "your-project-key"
      }
    }
  }
}
```

## Available Tools

The MCP server provides the following tools:

### Feature Management
- `list_features` - List all feature flags
- `create_feature` - Create a new feature flag
- `update_feature` - Update an existing feature flag
- `update_feature_status` - Update feature flag status
- `delete_feature` - Delete a feature flag
- `enable_feature_targeting` - Enable targeting for a feature
- `disable_feature_targeting` - Disable targeting for a feature

### Environment Management
- `list_environments` - List all environments
- `get_sdk_keys` - Get SDK keys for an environment
- `create_environment` - Create a new environment
- `update_environment` - Update an existing environment

### Project Management
- `list_projects` - List all projects
- `get_current_project` - Get current project details
- `create_project` - Create a new project
- `update_project` - Update an existing project

### Variable Management
- `list_variables` - List all variables
- `create_variable` - Create a new variable
- `update_variable` - Update an existing variable
- `delete_variable` - Delete a variable

### Self-Targeting
- `get_self_targeting_identity` - Get your current identity
- `update_self_targeting_identity` - Update your identity
- `list_self_targeting_overrides` - List your overrides
- `set_self_targeting_override` - Set a targeting override
- `clear_feature_self_targeting_overrides` - Clear overrides for a feature
- `clear_all_self_targeting_overrides` - Clear all overrides

## Usage Examples

### Basic Feature Management
```
AI: "List all feature flags in the current project"
AI: "Create a new feature flag called 'new-checkout-flow' with type 'release'"
AI: "Update the feature flag 'user-dashboard' to set the status to 'active'"
```

### Environment Operations
```
AI: "Show me all environments in this project"
AI: "Get the SDK keys for the 'production' environment"
AI: "Create a new staging environment called 'staging-v2'"
```

### Self-Targeting
```
AI: "Set my targeting override for feature 'beta-features' in 'development' to variation 'enabled'"
AI: "Clear all my targeting overrides"
```

## Troubleshooting

### Common Issues

#### Authentication Failed
```
Error: No authentication found. Please set DEVCYCLE_CLIENT_ID and DEVCYCLE_CLIENT_SECRET environment variables
```

**Solution**: Ensure you have set the required environment variables or run `dvc login sso`.

#### No Project Configured
```
Error: No project configured. Please set DEVCYCLE_PROJECT_KEY environment variable
```

**Solution**: Set the `DEVCYCLE_PROJECT_KEY` environment variable or run `dvc projects select your-project-key`.

#### MCP Server Not Found
```
Error: Command 'dvc-mcp' not found
```

**Solution**: Ensure the DevCycle CLI is installed globally: `npm install -g @devcycle/cli`

#### Permission Denied
```
Error: Permission denied or insufficient privileges
```

**Solution**: Ensure your API credentials have the necessary permissions for the actions you're trying to perform.

### Debug Mode

To enable debug logging, set the `DEBUG` environment variable:

```bash
export DEBUG=devcycle:*
```

### Verification

Test the MCP server installation:

```bash
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | dvc-mcp
```

This should return a JSON response with the list of available tools.

## Support

For issues and questions:
- GitHub Issues: https://github.com/DevCycleHQ/cli/issues
- Documentation: https://docs.devcycle.com/
- Support: support@devcycle.com

## Next Steps

- Explore the [Distribution Plan](DISTRIBUTION_PLAN.md) for advanced deployment options
- Check the main [README](../../README.md) for CLI usage examples
- Visit the [DevCycle Documentation](https://docs.devcycle.com/) for comprehensive guides