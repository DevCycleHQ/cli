# DevCycle CLI to MCP Server Planning Document

## Executive Summary

This document outlines the plan to transform the DevCycle CLI into a Model Context Protocol (MCP) server, enabling AI coding assistants like Cursor and Claude Code to seamlessly interact with DevCycle's feature flag management capabilities.

## What is MCP?

The Model Context Protocol (MCP) is an open standard developed by Anthropic that standardizes how AI applications connect to data sources and tools. It acts as a "USB-C port for AI applications," providing a universal way to connect AI models to external systems.

### Key MCP Concepts
- **Hosts**: AI applications that initiate connections (e.g., Cursor, Claude Code)
- **Clients**: Connectors within the host application  
- **Servers**: Services that provide context and capabilities
- **Protocol**: JSON-RPC 2.0 based communication

### MCP Server Capabilities
1. **Tools**: Functions that can be called by the LLM (with user approval)
2. **Resources**: File-like data that can be read by clients
3. **Prompts**: Pre-written templates for common tasks

## Current DevCycle CLI Analysis

### Architecture
- Built with oclif framework and TypeScript
- Uses DevCycle Management API with authentication via client credentials or SSO
- Supports repository configuration with `.devcycle/config.yml`

### Major Features
1. **Feature Management**: Create, view, modify Features, Variables, Variations, and Targeting Rules
2. **Code Analysis**: Detect DevCycle Variable usages in codebase
3. **Self-Targeting Overrides**: Manage overrides for quick testing
4. **Type Generation**: Generate TypeScript definitions
5. **Repository Integration**: Git-aware diff and usage detection

### Key Command Categories
- `features`: CRUD operations on features
- `variables`: CRUD operations on variables  
- `variations`: Manage feature variations
- `targeting`: Configure targeting rules
- `environments`: Manage environments
- `projects`: Project management
- `organizations`: Organization selection
- `overrides`: Self-targeting overrides
- `usages`: Detect variable usage in code
- `diff`: Show changes between code versions
- `cleanup`: Replace variables with static values
- `generate`: Generate type definitions

## MCP Server Design

### 1. Architecture Overview

```
AI Coding Assistant (Cursor/Claude Code)
          ↓ (MCP Client)
    MCP Server (DevCycle)
          ↓ (HTTP/API calls)
    DevCycle Management API
```

### 2. Transport Mechanism

**Primary**: stdio transport for local development
- Communicates via stdin/stdout
- Launched by AI host applications
- No network configuration required

**Future**: HTTP transport for remote deployment
- RESTful endpoints with Server-Sent Events (SSE)
- OAuth 2.0 authentication
- Scalable for team/enterprise use

### 3. MCP Tools Design

#### 3.1 Feature Management Tools

**`list_features`**
- Description: List all features in a project
- Parameters: `search` (optional), `page` (optional), `per_page` (optional)
- Returns: Array of feature objects with keys, names, descriptions, and status

**`get_feature`**
- Description: Get detailed information about a specific feature
- Parameters: `feature_key` (required)
- Returns: Complete feature object with variables, variations, and targeting

**`create_feature`**
- Description: Create a new feature flag
- Parameters: `key`, `name`, `description`, `type`, `variations`
- Returns: Created feature object

**`update_feature`**
- Description: Update an existing feature
- Parameters: `feature_key`, `name`, `description`, `variations`
- Returns: Updated feature object

#### 3.2 Variable Management Tools

**`list_variables`**
- Description: List all variables in a project
- Parameters: `search`, `page`, `per_page`
- Returns: Array of variable objects

**`get_variable`**
- Description: Get detailed variable information
- Parameters: `variable_key`
- Returns: Variable object with type, default value, and variations

**`create_variable`**
- Description: Create a new variable
- Parameters: `key`, `name`, `description`, `type`, `default_value`
- Returns: Created variable object

#### 3.3 Code Analysis Tools

**`scan_variable_usages`**
- Description: Scan codebase for DevCycle variable usage
- Parameters: `include_patterns`, `exclude_patterns`, `client_names`, `match_patterns`
- Returns: Usage report with file locations and variable references

**`diff_variable_usage`**
- Description: Compare variable usage between code versions
- Parameters: `base_ref`, `head_ref`, `include_patterns`, `exclude_patterns`
- Returns: Diff report showing added/removed variable usage

#### 3.4 Targeting and Environment Tools

**`list_environments`**
- Description: List project environments
- Returns: Array of environment objects

**`get_targeting_rules`**
- Description: Get targeting rules for a feature
- Parameters: `feature_key`, `environment_key`
- Returns: Targeting configuration

**`update_targeting`**
- Description: Update targeting rules
- Parameters: `feature_key`, `environment_key`, `targeting_rules`
- Returns: Updated targeting configuration

#### 3.5 Override Management Tools

**`list_overrides`**
- Description: List current self-targeting overrides
- Returns: Array of active overrides

**`set_override`**
- Description: Set a self-targeting override
- Parameters: `variable_key`, `value`, `environment_key`
- Returns: Override confirmation

**`clear_overrides`**
- Description: Clear all or specific overrides
- Parameters: `variable_keys` (optional)
- Returns: Cleared override confirmation

#### 3.6 Project and Organization Tools

**`list_projects`**
- Description: List available projects
- Returns: Array of project objects

**`get_current_project`**
- Description: Get currently selected project
- Returns: Current project information

**`select_project`**
- Description: Switch to a different project
- Parameters: `project_key`
- Returns: Project selection confirmation

### 4. MCP Resources Design

#### 4.1 Configuration Resources

**`config://repo`**
- URI: `devcycle://config/repo`
- Description: Current repository configuration
- Content: YAML configuration file content

**`config://auth`**
- URI: `devcycle://config/auth`
- Description: Authentication status and configuration
- Content: Current auth state (without sensitive data)

#### 4.2 Project Data Resources

**`project://features`**
- URI: `devcycle://project/features`
- Description: All features in current project
- Content: JSON array of feature objects

**`project://variables`**
- URI: `devcycle://project/variables`
- Description: All variables in current project
- Content: JSON array of variable objects

#### 4.3 Code Analysis Resources

**`analysis://usages`**
- URI: `devcycle://analysis/usages`
- Description: Latest variable usage scan results
- Content: JSON report of variable usage in codebase

**`analysis://types`**
- URI: `devcycle://analysis/types`
- Description: Generated TypeScript type definitions
- Content: TypeScript definition file

### 5. MCP Prompts Design

#### 5.1 Feature Management Prompts

**`create_feature_flag`**
- Description: "Create a new feature flag with best practices"
- Template: Guides through feature creation with naming conventions
- Parameters: `feature_name`, `description`, `feature_type`

**`setup_targeting`**
- Description: "Set up targeting rules for a feature"
- Template: Helps configure audience targeting
- Parameters: `feature_key`, `environment`, `targeting_strategy`

#### 5.2 Code Integration Prompts

**`implement_feature_flag`**
- Description: "Generate code to implement a feature flag"
- Template: Provides code snippets for different SDKs
- Parameters: `variable_key`, `language`, `default_value`

**`cleanup_removed_flags`**
- Description: "Clean up removed feature flags from code"
- Template: Guides through safe flag removal process
- Parameters: `variable_keys`, `replacement_values`

## Implementation Plan

### Phase 1: Core MCP Server Setup (Week 1-2)
1. **Project Structure**
   - Create new `src/mcp/` directory
   - Set up MCP server entry point
   - Configure TypeScript build for MCP server

2. **Basic MCP Implementation**
   - Implement stdio transport
   - Set up capability negotiation
   - Create base server class extending existing CLI base

3. **Authentication Integration**
   - Reuse existing authentication system
   - Handle token management
   - Project selection integration

### Phase 2: Essential Tools Implementation (Week 3-4)
1. **Feature Management Tools**
   - `list_features`, `get_feature`
   - `create_feature`, `update_feature`
   - Error handling and validation

2. **Variable Management Tools**
   - `list_variables`, `get_variable`
   - `create_variable`
   - Type safety and schema validation

3. **Project Management Tools**
   - `list_projects`, `get_current_project`
   - `select_project`

### Phase 3: Code Analysis Tools (Week 5-6)
1. **Usage Analysis**
   - `scan_variable_usages` tool
   - Reuse existing parsing logic
   - File filtering and pattern matching

2. **Diff Analysis**
   - `diff_variable_usage` tool
   - Git integration for version comparison
   - Change detection and reporting

### Phase 4: Advanced Features (Week 7-8)
1. **Targeting and Overrides**
   - Targeting rule management tools
   - Override management tools
   - Environment-specific operations

2. **Resources Implementation**
   - Configuration resources
   - Project data resources
   - Analysis result resources

### Phase 5: Prompts and Polish (Week 9-10)
1. **Prompt Templates**
   - Feature creation prompts
   - Code implementation prompts
   - Best practice guidance

2. **Testing and Documentation**
   - Comprehensive testing
   - Integration testing with Claude Code/Cursor
   - Documentation and examples

### Phase 6: HTTP Transport (Week 11-12)
1. **HTTP Server Implementation**
   - Server-Sent Events support
   - RESTful endpoint structure
   - Session management

2. **Authentication and Security**
   - OAuth 2.0 integration
   - API key authentication
   - Rate limiting and security

## Technical Implementation Details

### 1. Project Structure
```
src/
├── mcp/
│   ├── server.ts              # Main MCP server implementation
│   ├── tools/                 # MCP tool implementations
│   │   ├── features.ts
│   │   ├── variables.ts
│   │   ├── analysis.ts
│   │   └── index.ts
│   ├── resources/             # MCP resource implementations
│   │   ├── config.ts
│   │   ├── project.ts
│   │   └── index.ts
│   ├── prompts/               # MCP prompt templates
│   │   ├── feature-management.ts
│   │   ├── code-integration.ts
│   │   └── index.ts
│   ├── transports/            # Transport implementations
│   │   ├── stdio.ts
│   │   ├── http.ts
│   │   └── index.ts
│   └── index.ts               # MCP server entry point
```

### 2. Dependencies
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest",
    "zod": "^3.24.2"
  }
}
```

### 3. Configuration Integration
- Reuse existing `.devcycle/config.yml` structure
- Extend configuration for MCP-specific settings
- Maintain backward compatibility with CLI

### 4. Error Handling Strategy
- Wrap API errors in MCP-compatible error responses
- Provide helpful error messages for common issues
- Graceful degradation when API is unavailable

### 5. Performance Considerations
- Cache frequently accessed data (features, variables)
- Implement request batching for bulk operations
- Optimize file scanning for large codebases

## Integration Examples

### 1. Cursor Integration
```json
{
  "mcpServers": {
    "devcycle": {
      "command": "node",
      "args": ["/path/to/devcycle-mcp-server/dist/mcp/index.js"]
    }
  }
}
```

### 2. Claude Code Integration
```bash
claude mcp add devcycle npx @devcycle/cli mcp-server
```

### 3. Usage Scenarios

**Scenario 1: Creating a Feature Flag**
```
User: "Create a feature flag for the new checkout flow"
AI: Uses create_feature tool → Creates feature with best practices
AI: Uses implement_feature_flag prompt → Generates implementation code
```

**Scenario 2: Code Review Analysis**
```
User: "What feature flags are being added in this PR?"
AI: Uses diff_variable_usage tool → Analyzes code changes
AI: Provides summary of new feature flag usage
```

**Scenario 3: Cleanup Assistance**
```
User: "Help me remove the old_checkout_flow feature flag"
AI: Uses scan_variable_usages → Finds all usage locations
AI: Uses cleanup_removed_flags prompt → Guides through removal
```

## Benefits and Value Proposition

### For Developers
- **Seamless Integration**: Feature flag management directly in coding environment
- **Context-Aware Assistance**: AI understands current project state
- **Code Analysis**: Automatic detection of feature flag usage
- **Best Practices**: Built-in guidance for feature flag implementation

### For Teams
- **Consistency**: Standardized feature flag practices across team
- **Visibility**: Easy access to feature flag status during code review
- **Efficiency**: Reduced context switching between tools
- **Documentation**: Automatic documentation of feature flag usage

### For DevCycle
- **Market Expansion**: First feature flag platform with native AI integration
- **Developer Experience**: Superior DX compared to competitors
- **Ecosystem Growth**: Enable third-party integrations through MCP
- **Competitive Advantage**: Unique positioning in the market

## Risk Assessment and Mitigation

### Technical Risks
1. **MCP Protocol Changes**: Monitor MCP specification updates
2. **Performance Issues**: Implement caching and optimization
3. **Authentication Complexity**: Reuse proven CLI auth patterns

### Product Risks
1. **User Adoption**: Provide clear documentation and examples
2. **Feature Completeness**: Prioritize most-used CLI features
3. **Maintenance Overhead**: Design for extensibility and maintainability

### Mitigation Strategies
- Start with stdio transport for simplicity
- Reuse existing CLI codebase extensively
- Implement comprehensive testing
- Create detailed documentation and examples

## Success Metrics

### Technical Metrics
- MCP server response time < 500ms for most operations
- 99% uptime for HTTP transport
- Zero authentication-related security issues

### Adoption Metrics
- Number of developers using MCP integration
- Frequency of MCP tool usage
- User satisfaction scores

### Business Metrics
- Increased DevCycle API usage
- Improved developer onboarding time
- Positive feedback from AI coding assistant communities

## Conclusion

Converting the DevCycle CLI into an MCP server represents a significant opportunity to pioneer AI-native developer tooling in the feature flag space. By leveraging the existing CLI codebase and MCP's standardized protocol, we can deliver a seamless experience that enhances developer productivity while maintaining DevCycle's position as an innovative platform.

The phased implementation approach ensures manageable development cycles while delivering value incrementally. The focus on reusing existing CLI functionality minimizes risk while maximizing the potential for rapid deployment and adoption.

This initiative positions DevCycle at the forefront of the AI-assisted development workflow revolution, providing a competitive advantage that will be difficult for competitors to replicate. 