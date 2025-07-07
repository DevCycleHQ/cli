# DevCycle MCP Hackathon Implementation Plan

## Overview

This document outlines the implementation plan for 4 core DevCycle MCP tools in priority order.

## Target Tools

1. `list_features` / `get_feature` / `list_variables` / `get_variable`
2. `get_sdk_keys`
3. `enable_targeting` / `disable_targeting`
4. `create_feature` (interactive)

## Implementation Order

### 1. List/Get Features and Variables

#### `list_features`
**Implementation Time**: 1.5 hours  
**Complexity**: Low  
**Files to leverage**: `src/api/features.ts`, `src/commands/features/list.ts`

```typescript
async listFeatures(args: { 
  search?: string, 
  page?: number,
  per_page?: number 
}) {
  // Reuse fetchFeatures from src/api/features.ts
  return await this.api.fetchFeatures(args)
}
```

#### `get_feature`
**Implementation Time**: 1 hour  
**Complexity**: Low  
**Files to leverage**: `src/api/features.ts`, `src/commands/features/get.ts`

```typescript
async getFeature(args: { feature_key: string }) {
  // Reuse fetchFeature from src/api/features.ts
  return await this.api.fetchFeature(args.feature_key)
}
```

#### `list_variables`
**Implementation Time**: 1.5 hours  
**Complexity**: Low  
**Files to leverage**: `src/api/variables.ts`, `src/commands/variables/list.ts`

```typescript
async listVariables(args: { 
  search?: string, 
  page?: number,
  per_page?: number 
}) {
  // Reuse fetchVariables from src/api/variables.ts
  return await this.api.fetchVariables(args)
}
```

#### `get_variable`
**Implementation Time**: 1 hour  
**Complexity**: Low  
**Files to leverage**: `src/api/variables.ts`, `src/commands/variables/get.ts`

```typescript
async getVariable(args: { variable_key: string }) {
  // Reuse fetchVariable from src/api/variables.ts
  return await this.api.fetchVariable(args.variable_key)
}
```

### 2. Get SDK Keys

#### `get_sdk_keys`
**Implementation Time**: 2 hours  
**Complexity**: Medium  
**Files to leverage**: `src/api/environments.ts`, `src/commands/keys/get.ts`

```typescript
async getSdkKeys(args: { 
  environment_key: string,
  key_type?: 'mobile' | 'server' | 'client'
}) {
  // Reuse fetchEnvironment from src/api/environments.ts
  // Extract SDK keys based on key_type filter
  const env = await this.api.fetchEnvironment(args.environment_key)
  return {
    mobile: env.sdkKeys?.mobile,
    server: env.sdkKeys?.server,
    client: env.sdkKeys?.client
  }
}
```

### 3. Enable/Disable Targeting

#### `enable_targeting`
**Implementation Time**: 2 hours  
**Complexity**: Medium  
**Files to leverage**: `src/api/targeting.ts`, `src/commands/targeting/enable.ts`

```typescript
async enableTargeting(args: { 
  feature_key: string,
  environment_key: string 
}) {
  // Reuse updateTargeting from src/api/targeting.ts
  return await this.api.updateTargeting(
    args.feature_key,
    args.environment_key,
    { status: 'active' }
  )
}
```

#### `disable_targeting`
**Implementation Time**: 1.5 hours  
**Complexity**: Medium  
**Files to leverage**: `src/api/targeting.ts`, `src/commands/targeting/disable.ts`

```typescript
async disableTargeting(args: { 
  feature_key: string,
  environment_key: string 
}) {
  // Reuse updateTargeting from src/api/targeting.ts
  return await this.api.updateTargeting(
    args.feature_key,
    args.environment_key,
    { status: 'inactive' }
  )
}
```

### 4. Interactive Create Feature

#### `create_feature`
**Implementation Time**: 3 hours  
**Complexity**: High  
**Files to leverage**: `src/commands/features/create.ts`, `src/ui/prompts/featurePrompts.ts`

```typescript
async createFeature(args: { 
  key?: string,
  name?: string,
  description?: string,
  type?: 'release' | 'experiment' | 'permission' | 'ops',
  interactive?: boolean 
}) {
  // If interactive mode, use prompts from src/ui/prompts/featurePrompts.ts
  // Otherwise use provided args directly
  // Reuse createFeature logic from src/commands/features/create.ts
  
  if (args.interactive) {
    // Use existing prompt functions but adapt for MCP
    // May need to return prompt questions for AI to handle
    return {
      requires_input: true,
      questions: [
        { field: 'key', prompt: 'Enter feature key:', required: true },
        { field: 'name', prompt: 'Enter feature name:', required: true },
        { field: 'description', prompt: 'Enter description:', required: false },
        { field: 'type', prompt: 'Select type:', options: ['release', 'experiment', 'permission', 'ops'] }
      ]
    }
  } else {
    // Direct creation with provided args
    return await this.api.createFeature(args)
  }
}
```

## Implementation Notes

### Authentication Integration
- Reuse existing auth patterns from `src/auth/ApiAuth.ts`
- Use `TokenCache` for token management
- Maintain compatibility with existing CLI authentication

### Error Handling
- Wrap API errors in MCP-compatible error responses
- Provide clear error messages for common issues
- Use existing validation from CLI commands

### File Structure

```
src/mcp/
├── index.ts                    # MCP server entry point
├── server.ts                   # Main server implementation
├── tools/
│   ├── features.ts            # Feature and variable tools
│   ├── environments.ts        # SDK keys and targeting tools
│   └── index.ts
└── utils/
    ├── auth.ts                # Authentication helpers
    └── api.ts                 # API client wrapper
```

## Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest",
    "zod": "^3.23.0"
  }
}
```
