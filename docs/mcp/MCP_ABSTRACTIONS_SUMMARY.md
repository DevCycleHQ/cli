# DevCycle MCP Abstractions Summary

This document provides a quick reference of all MCP abstractions for the DevCycle MCP server - both implemented and planned features.

## Currently Implemented MCP Tools

### 1. Feature Management
- `list_features` - List all features with search/pagination
- `create_feature` - Create new feature flag
- `update_feature` - Update existing feature
- `update_feature_status` - Update feature status (active/complete/archived)
- `delete_feature` - Delete a feature ⚠️
- `fetch_feature_variations` - Get variations for a feature
- `create_feature_variation` - Create new variation
- `update_feature_variation` - Update variation properties ⚠️
- `get_feature_audit_log_history` - Get timeline of feature changes

### 2. Variable Management
- `list_variables` - List all variables
- `create_variable` - Create new variable
- `update_variable` - Update variable properties ⚠️
- `delete_variable` - Delete a variable ⚠️

### 3. Environment Management
- `list_environments` - List project environments
- `get_sdk_keys` - Retrieve SDK keys for environment
- `create_environment` - Create new environment
- `update_environment` - Update environment settings

### 4. Project & Organization
- `list_projects` - List all projects in organization
- `get_current_project` - Get currently selected project
- `create_project` - Create new project
- `update_project` - Update project settings

### 5. Custom Properties Management
- `list_custom_properties` - List custom properties
- `create_custom_property` - Create new custom property
- `update_custom_property` - Update custom property ⚠️
- `delete_custom_property` - Delete custom property ⚠️

### 6. Targeting Management
- `enable_feature_targeting` - Enable targeting for environment ⚠️
- `disable_feature_targeting` - Disable targeting for environment ⚠️
- `list_feature_targeting` - Get targeting rules for feature
- `update_feature_targeting` - Update targeting rules ⚠️

### 7. Self-Targeting & Override Management
- `get_self_targeting_identity` - Get current DevCycle identity
- `update_self_targeting_identity` - Update identity for testing
- `list_self_targeting_overrides` - List current overrides
- `set_self_targeting_override` - Set override for testing ⚠️
- `clear_feature_self_targeting_overrides` - Clear specific overrides ⚠️
- `clear_all_self_targeting_overrides` - Clear all overrides

### 8. Results & Analytics
- `get_feature_total_evaluations` - Get feature evaluation metrics
- `get_project_total_evaluations` - Get project-wide evaluation metrics

⚠️ = Requires confirmation for production environments

## Planned Features (Not Yet Implemented)

### MCP Resources (Read-only data access)
- `devcycle://config/repo` - Repository configuration
- `devcycle://config/auth` - Auth status
- `devcycle://project/features` - All features
- `devcycle://project/variables` - All variables
- `devcycle://project/environments` - All environments
- `devcycle://analysis/usages` - Latest usage scan
- `devcycle://analysis/types` - Generated types
- `devcycle://analysis/unknown-variables` - Undefined variables
- `devcycle://targeting/rules/{feature}` - Feature targeting rules
- `devcycle://overrides/current` - Active overrides
- `devcycle://environments/sdk-keys` - All SDK keys

### MCP Prompts (Guided workflows)
- `create_feature_flag` - Guided feature creation
- `setup_targeting` - Configure targeting rules
- `implement_feature_flag` - Generate implementation code
- `analyze_feature_usage` - Comprehensive usage analysis
- `setup_testing_overrides` - QA testing configuration

### Code Analysis Tools
- `analyze_variable_usage` - Comprehensive usage scanning
- `cleanup_variable` - Replace variable with static value
- `find_unknown_variables` - Identify undefined variables
- `get_feature_history` - Git history of feature flag usage

### Type Generation
- `generate_typescript_types` - Generate TypeScript definitions

### Advanced Targeting
- `get_audiences` - List reusable audience definitions
- `validate_targeting_rule` - Validate targeting before applying
- `create_targeting_rule` - Create new targeting rule (beyond basic enable/disable)

### Environment Management (Advanced)
- `clone_environment` - Clone environment configuration

### Advanced Analytics
- `get_variation_distribution` - Variation serve distribution
- `get_feature_usage_metrics` - Detailed usage statistics

### Git Integration
- `analyze_pr_changes` - Analyze feature flag changes in PR
- `devcycle://git/feature-changes` - Recent changes
- `devcycle://git/pr-analysis` - PR flag analysis

## Implementation Status

### ✅ Implemented
- Core CRUD operations for features, variables, environments, projects
- Basic targeting enable/disable
- Self-targeting and override management
- Basic analytics (evaluation counts)
- Custom properties management

### 🚧 In Progress
- None currently

### 📋 Planned
- MCP Resources for read-only data access
- MCP Prompts for guided workflows
- Code analysis and usage scanning
- Type generation
- Advanced targeting with audience management
- Git integration and PR analysis
- Advanced analytics and metrics

## Notes

1. The current implementation focuses on direct API operations that modify DevCycle configuration
2. Code analysis features from the CLI (usages, cleanup, diff) are not yet exposed via MCP
3. MCP Resources and Prompts are part of the MCP specification but not yet implemented
4. All destructive operations include warnings and require user confirmation
