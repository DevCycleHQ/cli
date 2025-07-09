# DevCycle MCP Server Distribution Plan

## Overview

This document outlines the comprehensive distribution strategy for the DevCycle MCP (Model Context Protocol) server, designed to enable seamless integration with AI coding assistants like Cursor and Claude Desktop.

## Architecture

### Design Rationale

The MCP server is designed as a separate binary that leverages the existing DevCycle CLI infrastructure while providing a specialized interface for AI assistants. This approach offers several advantages:

1. **Isolation**: The MCP server runs as a separate process, preventing conflicts with the main CLI
2. **Reusability**: Leverages existing API clients, authentication, and configuration systems
3. **Maintainability**: Shares code with the CLI while providing MCP-specific functionality
4. **Security**: Respects existing DevCycle permissions and authentication mechanisms

### System Architecture

```
AI Assistant (Cursor/Claude Desktop)
         ↓
    MCP Protocol (stdio)
         ↓
    DevCycle MCP Server (dvc-mcp)
         ↓
    DevCycle API Client
         ↓
    DevCycle Management API
```

## Distribution Methods

### 1. Primary Distribution: NPM Package

**Target**: Developers using Node.js ecosystem

**Installation**:
```bash
npm install -g @devcycle/cli
```

**Benefits**:
- Automatic updates through npm
- Familiar installation process for developers
- Integrated with existing CLI distribution
- Cross-platform compatibility
- Dependency management handled by npm

**Configuration**:
The MCP server binary is automatically available as `dvc-mcp` after CLI installation.

### 2. Standalone Binaries

**Target**: Environments without Node.js or for simplified deployment

**Installation**:
Download platform-specific binaries from GitHub releases:

- Linux: `dvc-mcp-linux-x64`
- macOS: `dvc-mcp-macos-x64`
- Windows: `dvc-mcp-win-x64.exe`

**Benefits**:
- No Node.js dependency
- Single file deployment
- Reduced startup time
- Enterprise-friendly distribution

**Build Process**:
```bash
yarn build:mcp-standalone
```

Creates binaries using `pkg` for all supported platforms.

### 3. Future: Docker Distribution

**Target**: Containerized environments and team deployments

**Features** (planned):
- Multi-architecture Docker images
- HTTP transport for remote access
- Scalable deployment options
- Environment-based configuration

**Example Usage**:
```bash
docker run -p 8080:8080 devcycle/mcp-server:latest
```

## Installation Guides

### Cursor IDE Integration

1. **Install DevCycle CLI**:
   ```bash
   npm install -g @devcycle/cli
   ```

2. **Configure Authentication**:
   ```bash
   export DEVCYCLE_CLIENT_ID="your-client-id"
   export DEVCYCLE_CLIENT_SECRET="your-client-secret"
   export DEVCYCLE_PROJECT_KEY="your-project-key"
   ```

3. **Update Cursor Settings** (`.cursor/settings.json`):
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

### Claude Desktop Integration

1. **Install DevCycle CLI**:
   ```bash
   npm install -g @devcycle/cli
   ```

2. **Configure Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
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

### Standalone Binary Installation

1. **Download Binary**:
   ```bash
   curl -L https://github.com/DevCycleHQ/cli/releases/latest/download/dvc-mcp-linux-x64 -o dvc-mcp
   chmod +x dvc-mcp
   ```

2. **Add to PATH**:
   ```bash
   sudo mv dvc-mcp /usr/local/bin/
   ```

3. **Configure MCP Client** (same as above, but using direct binary path if needed)

## Authentication & Security

### Authentication Methods

The MCP server supports multiple authentication methods in order of precedence:

1. **Environment Variables** (Recommended):
   ```bash
   DEVCYCLE_CLIENT_ID="your-client-id"
   DEVCYCLE_CLIENT_SECRET="your-client-secret"
   DEVCYCLE_PROJECT_KEY="your-project-key"
   ```

2. **CLI Authentication**:
   ```bash
   dvc login sso
   dvc projects select your-project-key
   ```

3. **Configuration Files**:
   - Repository: `.devcycle/config.yml`
   - User: `~/.config/devcycle/user.yml`

### Security Considerations

- **Process Isolation**: MCP server runs as a separate process from the main CLI
- **No Elevated Privileges**: Server runs with user-level permissions
- **Stdio Communication**: Only communicates through standard input/output
- **Existing Permissions**: Respects DevCycle API permissions and project access
- **No Data Persistence**: No local data storage or caching beyond standard CLI behavior

## Build and Release Process

### Automated Build Pipeline

The CI/CD pipeline (`.github/workflows/release-mcp.yml`) handles:

1. **Version Detection**: Triggered on git tags matching version patterns
2. **Cross-Platform Building**: Compiles for Linux, macOS, and Windows
3. **Testing**: Runs comprehensive test suite including MCP server tests
4. **NPM Publishing**: Publishes updated CLI package with MCP server
5. **Binary Creation**: Generates standalone binaries for all platforms
6. **GitHub Release**: Creates release with binaries and changelog
7. **Documentation Updates**: Updates installation guides and version info

### Manual Release Process

For manual releases:

1. **Version Bump**:
   ```bash
   npm version patch|minor|major
   ```

2. **Build MCP Server**:
   ```bash
   yarn build:mcp
   ```

3. **Create Standalone Binaries**:
   ```bash
   yarn build:mcp-standalone
   ```

4. **Test Installation**:
   ```bash
   echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | dvc-mcp
   ```

5. **Publish to NPM**:
   ```bash
   npm publish
   ```

### Release Artifacts

Each release includes:
- Updated npm package with MCP server
- Standalone binaries for Linux, macOS, Windows
- Installation instructions
- Changelog with new features and fixes
- Platform-specific installation guides

## Testing & Validation

### Unit Tests

- **Tool Handlers**: Validate each MCP tool function
- **Authentication**: Test all authentication methods
- **Error Handling**: Verify proper error responses
- **Schema Validation**: Ensure parameter validation works correctly

### Integration Tests

- **MCP Protocol**: Test full MCP request/response cycles
- **API Integration**: Verify calls to DevCycle Management API
- **Cross-Platform**: Test on Linux, macOS, and Windows
- **Client Integration**: Test with Cursor and Claude Desktop

### Performance Tests

- **Startup Time**: Measure time to initialize MCP server
- **Tool Execution**: Benchmark individual tool performance
- **Memory Usage**: Monitor resource consumption
- **Concurrent Requests**: Test handling of multiple simultaneous requests

## Deployment Examples

### CI/CD Integration

**GitHub Actions**:
```yaml
- name: Setup DevCycle MCP
  run: |
    npm install -g @devcycle/cli
    echo "DEVCYCLE_CLIENT_ID=${{ secrets.DEVCYCLE_CLIENT_ID }}" >> $GITHUB_ENV
    echo "DEVCYCLE_CLIENT_SECRET=${{ secrets.DEVCYCLE_CLIENT_SECRET }}" >> $GITHUB_ENV
    echo "DEVCYCLE_PROJECT_KEY=${{ secrets.DEVCYCLE_PROJECT_KEY }}" >> $GITHUB_ENV
```

**Jenkins Pipeline**:
```groovy
pipeline {
  environment {
    DEVCYCLE_CLIENT_ID = credentials('devcycle-client-id')
    DEVCYCLE_CLIENT_SECRET = credentials('devcycle-client-secret')
    DEVCYCLE_PROJECT_KEY = credentials('devcycle-project-key')
  }
  stages {
    stage('Setup') {
      steps {
        sh 'npm install -g @devcycle/cli'
      }
    }
  }
}
```

### Team Deployment

**Shared Configuration**:
```bash
# Team environment file
export DEVCYCLE_CLIENT_ID="team-client-id"
export DEVCYCLE_CLIENT_SECRET="team-client-secret"
export DEVCYCLE_PROJECT_KEY="team-project-key"
```

**Docker Compose** (future):
```yaml
version: '3.8'
services:
  devcycle-mcp:
    image: devcycle/mcp-server:latest
    ports:
      - "8080:8080"
    environment:
      - DEVCYCLE_CLIENT_ID=${DEVCYCLE_CLIENT_ID}
      - DEVCYCLE_CLIENT_SECRET=${DEVCYCLE_CLIENT_SECRET}
      - DEVCYCLE_PROJECT_KEY=${DEVCYCLE_PROJECT_KEY}
```

## Monitoring & Observability

### Logging

The MCP server provides structured logging:

- **Request/Response Logging**: All MCP tool calls are logged
- **Error Tracking**: Detailed error information with context
- **Performance Metrics**: Tool execution times and resource usage
- **Authentication Events**: Login attempts and token refreshes

### Health Checks

```bash
# Verify MCP server is working
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | dvc-mcp
```

### Metrics

Future metrics collection:
- Tool usage frequency
- Error rates by tool
- Average response times
- Active user count

## Future Enhancements

### Short Term (Next 3 months)

1. **Enhanced Tool Coverage**:
   - Audience management tools
   - Metrics and analytics tools
   - Code usage detection tools

2. **Improved Developer Experience**:
   - Better error messages
   - Interactive setup wizard
   - Configuration validation

3. **Performance Optimizations**:
   - Response caching
   - Connection pooling
   - Startup time improvements

### Medium Term (3-6 months)

1. **HTTP Transport**:
   - REST API for remote access
   - WebSocket support for real-time updates
   - Multi-client support

2. **Advanced Features**:
   - Bulk operations
   - Transaction support
   - Change history tracking

3. **Enterprise Features**:
   - Team management
   - Audit logging
   - Role-based access control

### Long Term (6+ months)

1. **Cloud Integration**:
   - Hosted MCP server option
   - Auto-scaling capabilities
   - Global deployment

2. **Advanced AI Features**:
   - Intelligent suggestions
   - Automated feature flag management
   - Natural language query processing

3. **Ecosystem Integration**:
   - IDE plugins
   - CI/CD platform integrations
   - Third-party tool connectors

## Success Metrics

### Technical Metrics

- **Installation Success Rate**: >95% successful installations
- **Startup Time**: <2 seconds for MCP server initialization
- **Tool Response Time**: <500ms average for most operations
- **Error Rate**: <1% for well-formed requests
- **Cross-Platform Compatibility**: 100% on supported platforms

### User Experience Metrics

- **Setup Time**: <5 minutes from installation to first successful tool call
- **Documentation Clarity**: User feedback and support ticket volume
- **Feature Usage**: Adoption rates of different MCP tools
- **User Satisfaction**: Survey scores and GitHub issue sentiment

### Business Metrics

- **Adoption Rate**: Number of active MCP server installations
- **User Retention**: Monthly active users of MCP tools
- **Feature Usage**: Most/least used tools and features
- **Support Load**: Volume and types of support requests

## Support & Maintenance

### Support Channels

- **Documentation**: Comprehensive guides and troubleshooting
- **GitHub Issues**: Bug reports and feature requests
- **Community**: Discord/Slack channels for user support
- **Enterprise Support**: Direct support for enterprise customers

### Maintenance Schedule

- **Security Updates**: Released immediately as needed
- **Bug Fixes**: Monthly maintenance releases
- **Feature Updates**: Quarterly feature releases
- **LTS Support**: Long-term support for enterprise customers

### Compatibility

- **MCP Protocol**: Support for MCP v1.0 and future versions
- **Node.js**: Support for Node.js 16+ LTS versions
- **Operating Systems**: Windows 10+, macOS 12+, Linux (Ubuntu 18+)
- **AI Clients**: Cursor, Claude Desktop, and other MCP-compatible tools

This distribution plan ensures the DevCycle MCP server is accessible, maintainable, and provides excellent developer experience across all supported platforms and use cases.