# DevCycle CLI to MCP Server Planning Document

## Executive Summary

Transform the DevCycle CLI into a Model Context Protocol (MCP) server to enable AI coding assistants like Cursor and Claude Code to seamlessly interact with DevCycle's feature flag management capabilities.

## What is MCP?

MCP is an open standard by Anthropic that standardizes how AI applications connect to data sources and tools. It acts as a "USB-C port for AI applications."

**Key Components:**
- **Hosts**: AI applications (Cursor, Claude Code)
- **Servers**: Services providing capabilities (our DevCycle MCP server)
- **Protocol**: JSON-RPC 2.0 communication via stdin/stdout or HTTP

**Server Capabilities:**
1. **Tools**: Functions callable by LLM (with user approval)
2. **Resources**: File-like data readable by clients
3. **Prompts**: Pre-written templates for common tasks

## DevCycle CLI Analysis

**Current Architecture:**
- Built with oclif framework and TypeScript
- Uses DevCycle Management API with auth via client credentials/SSO
- Repository configuration with `.devcycle/config.yml`

**Major Features:**
- Feature/Variable/Variation management
- Code analysis (usage detection, diff)
- Self-targeting overrides
- Type generation
- Git-aware operations

## MCP Server Design

### Core Tools

#### Feature Management
- `list_features` - List all features with search/pagination
- `get_feature` - Get detailed feature information
- `create_feature` - Create new feature flag
- `update_feature` - Update existing feature

#### Variable Management  
- `list_variables` - List all variables
- `get_variable` - Get variable details
- `create_variable` - Create new variable

#### Code Analysis
- `scan_variable_usages` - Scan codebase for variable usage
- `diff_variable_usage` - Compare usage between code versions

#### Project/Environment
- `list_projects` - List available projects
- `get_current_project` - Get current project
- `select_project` - Switch projects
- `list_environments` - List environments

#### Overrides
- `list_overrides` - List current overrides
- `set_override` - Set self-targeting override
- `clear_overrides` - Clear overrides

### Resources

- `devcycle://config/repo` - Repository configuration
- `devcycle://project/features` - All project features
- `devcycle://project/variables` - All project variables
- `devcycle://analysis/usages` - Latest usage scan results

### Prompts

- `create_feature_flag` - Guide through feature creation
- `implement_feature_flag` - Generate implementation code
- `setup_targeting` - Configure targeting rules
- `cleanup_removed_flags` - Guide flag removal

## Implementation Plan

### Phase 1: Core Setup (Weeks 1-2)
- MCP server infrastructure
- stdio transport implementation
- Authentication integration
- Basic capability negotiation

### Phase 2: Essential Tools (Weeks 3-4)
- Feature and variable management tools
- Project management tools
- Error handling and validation

### Phase 3: Code Analysis (Weeks 5-6)
- Usage scanning tool
- Diff analysis tool
- File filtering and pattern matching

### Phase 4: Advanced Features (Weeks 7-8)
- Targeting and override tools
- Resource implementations
- Environment management

### Phase 5: Polish (Weeks 9-10)
- Prompt templates
- Comprehensive testing
- Documentation

### Phase 6: HTTP Transport (Weeks 11-12)
- HTTP server with SSE
- OAuth 2.0 authentication
- Production deployment

## Technical Implementation

### Project Structure
```
src/mcp/
├── server.ts              # Main MCP server
├── tools/                 # Tool implementations
│   ├── features.ts
│   ├── variables.ts
│   └── analysis.ts
├── resources/             # Resource implementations
├── prompts/               # Prompt templates
└── transports/            # stdio/HTTP transports
```

### Dependencies
```json
{
  "@modelcontextprotocol/sdk": "latest",
  "zod": "^3.24.2"
}
```

### Integration Examples

**Cursor Configuration:**
```json
{
  "mcpServers": {
    "devcycle": {
      "command": "node",
      "args": ["/path/to/devcycle-mcp/dist/index.js"]
    }
  }
}
```

**Usage Scenarios:**
1. "Create a feature flag for new checkout" → AI uses tools to create and implement
2. "What flags are in this PR?" → AI analyzes diff for flag usage
3. "Remove old_feature flag" → AI scans usage and guides cleanup

## Benefits

### For Developers
- Feature flag management in coding environment
- Context-aware AI assistance
- Automatic code analysis
- Built-in best practices

### For DevCycle
- First feature flag platform with native AI integration
- Superior developer experience
- Market differentiation
- Ecosystem growth

## Success Metrics
- Response time < 500ms
- High developer adoption
- Increased API usage
- Positive community feedback

## Risk Mitigation
- Start with stdio transport for simplicity
- Reuse existing CLI codebase extensively
- Implement comprehensive testing
- Monitor MCP specification changes

## Conclusion

This initiative positions DevCycle at the forefront of AI-assisted development, providing a significant competitive advantage by seamlessly integrating feature flag management into modern AI-powered coding workflows. 