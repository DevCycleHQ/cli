# DevCycle MCP Abstractions Summary

This document provides a quick reference of all recommended MCP abstractions for the DevCycle MCP server based on the CLI codebase analysis.

## MCP Tools

### 1. Feature Management

- `list_features` - List all features with search/pagination
- `get_feature` - Get detailed feature information  
- `create_feature` - Create new feature flag
- `update_feature` - Update existing feature
- `delete_feature` - Delete a feature

### 2. Variable Management

- `list_variables` - List all variables
- `get_variable` - Get variable details
- `create_variable` - Create new variable
- `update_variable` - Update variable properties
- `delete_variable` - Delete a variable

### 3. Variation Management

- `list_variations` - List variations for a feature
- `create_variation` - Create new variation
- `update_variation` - Update variation properties
- `get_variation` - Get specific variation details

### 4. Targeting Management

- `get_targeting_rules` - Get targeting for feature/environment
- `enable_targeting` - Enable targeting for environment
- `disable_targeting` - Disable targeting for environment
- `create_targeting_rule` - Create new targeting rule
- `update_targeting` - Update targeting rules
- `get_audiences` - List reusable audience definitions
- `validate_targeting_rule` - Validate targeting before applying

### 5. Code Analysis

- `analyze_variable_usage` - Comprehensive usage scanning with language detection
- `generate_usage_report` - Format usage analysis for documentation
- `cleanup_variable` - Replace variable with static value
- `analyze_pr_changes` - Analyze feature flag changes in PR
- `get_feature_history` - Git history of feature flag usage
- `find_unknown_variables` - Identify undefined variables in code

### 6. Environment Management

- `list_environments` - List project environments
- `get_environment` - Get environment details
- `create_environment` - Create new environment
- `update_environment` - Update environment settings
- `clone_environment` - Clone environment configuration
- `get_sdk_keys` - Retrieve SDK keys for environment

### 7. Project & Organization

- `list_projects` - List available projects
- `get_current_project` - Get current project
- `select_project` - Switch projects
- `list_organizations` - List available organizations
- `select_organization` - Switch organizations

### 8. Override Management

- `list_overrides` - List current overrides
- `set_override` - Set self-targeting override
- `clear_overrides` - Clear overrides
- `get_override` - Get specific override details

### 9. Identity Management

- `get_identity` - Get current DevCycle identity
- `update_identity` - Update identity for testing

### 10. Type Generation

- `generate_typescript_types` - Generate TypeScript definitions

### 11. Analytics

- `get_feature_usage_metrics` - Usage statistics
- `get_variation_distribution` - Variation serve distribution

## MCP Resources

### 1. Configuration

- `devcycle://config/repo` - Repository configuration
- `devcycle://config/auth` - Auth status

### 2. Project Data

- `devcycle://project/features` - All features
- `devcycle://project/variables` - All variables
- `devcycle://project/environments` - All environments

### 3. Analysis

- `devcycle://analysis/usages` - Latest usage scan
- `devcycle://analysis/types` - Generated types
- `devcycle://analysis/unknown-variables` - Undefined variables
- `devcycle://analysis/parser-patterns` - Active regex patterns
- `devcycle://analysis/variable-aliases` - Variable mappings

### 4. Targeting

- `devcycle://targeting/rules/{feature}` - Feature targeting rules
- `devcycle://targeting/active-rules` - All active rules

### 5. Overrides

- `devcycle://overrides/current` - Active overrides
- `devcycle://overrides/available` - Available features

### 6. Environment

- `devcycle://environments/sdk-keys` - All SDK keys
- `devcycle://environments/comparison` - Environment diff

### 7. Git Integration

- `devcycle://git/feature-changes` - Recent changes
- `devcycle://git/pr-analysis` - PR flag analysis

## MCP Prompts

### 1. Feature Management

- `create_feature_flag` - Guided feature creation
- `setup_targeting` - Configure targeting rules
- `plan_progressive_rollout` - Phased rollout strategy
- `create_killswitch` - Emergency rollback setup

### 2. Code Integration

- `implement_feature_flag` - Generate implementation code
- `cleanup_removed_flags` - Safe flag removal
- `refactor_flag_usage` - Best practices refactoring

### 3. Analysis & Review

- `analyze_feature_usage` - Comprehensive usage analysis
- `review_pr_flags` - PR review checklist
- `find_stale_flags` - Identify removable flags

### 4. Testing

- `setup_testing_overrides` - QA testing configuration
- `create_test_matrix` - Test case generation

### 5. Documentation

- `document_feature_flags` - Auto-generate docs
- `create_flag_runbook` - Operational procedures

### 6. Migration

- `migrate_feature_flags` - Project/environment migration

## Priority Implementation Order

1. **Core CRUD Tools** - Direct CLI command mappings
2. **Code Analysis Tools** - Leverage existing parsers
3. **Targeting & Overrides** - Essential for testing
4. **Resources** - Read-only data access
5. **Prompts** - AI-guided workflows
6. **Advanced Analytics** - Usage metrics and insights
