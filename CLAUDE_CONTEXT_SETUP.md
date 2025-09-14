# Claude Context Integration Setup

This guide will help you set up Claude Context MCP server integration with your Shadow Ticket application.

## Overview

Claude Context is an MCP (Model Context Protocol) server that provides semantic code search capabilities. When integrated with Shadow Ticket, it:

1. **Indexes repositories** when users select them
2. **Provides semantic search** to find relevant code
3. **Enhances ticket generation** with repository context

## Prerequisites

1. **OpenAI API Key**: Get one from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Zilliz Cloud Account**: Sign up at [Zilliz Cloud](https://cloud.zilliz.com/) for vector database
3. **Git**: Required for cloning repositories

## Setup Steps

### 1. Environment Configuration

Copy the example environment file and configure it:

```bash
cp env-example.txt .env.local
```

Edit `.env.local` and add your credentials:

```env
# Claude Context MCP Server Configuration
OPENAI_API_KEY=your_openai_api_key_here
MILVUS_TOKEN=your_zilliz_cloud_token_here
MILVUS_ADDRESS=your_zilliz_cloud_endpoint_here

# Claude Context MCP Server Settings
EMBEDDING_PROVIDER=OpenAI
EMBEDDING_MODEL=text-embedding-3-small
MCP_SERVER_PORT=3001
```

### 2. Get Zilliz Cloud Credentials

1. Go to [Zilliz Cloud](https://cloud.zilliz.com/)
2. Create a new cluster
3. Get your **API Key** and **Public Endpoint** from the cluster details
4. Add these to your `.env.local` file

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Start the Application

You have two options:

#### Option A: Start Everything Together
```bash
pnpm run dev:full
```

This starts both the Next.js app and Claude Context MCP server.

#### Option B: Start Separately

Terminal 1 (Next.js app):
```bash
pnpm run dev
```

Terminal 2 (Claude Context MCP server):
```bash
pnpm run claude-context
```

## How It Works

### 1. Repository Selection
When a user selects a repository in the repo picker:
- The repository is cloned to `/tmp/repos/`
- Indexing is triggered in the background
- The user can proceed to plan generation

### 2. Enhanced Ticket Generation
When generating tickets:
- The system searches the indexed repository for relevant code
- Context is included in the AI prompt
- Tickets are generated with better understanding of the codebase

### 3. API Endpoints

- `POST /api/index-repo` - Start indexing a repository
- `POST /api/search-code` - Search indexed code
- `GET /api/indexing-status` - Check indexing progress

## File Structure

```
shadow-ticket/
├── lib/
│   └── claude-context-service.ts    # MCP server communication
├── app/api/
│   ├── index-repo/route.ts          # Repository indexing endpoint
│   ├── search-code/route.ts         # Code search endpoint
│   └── indexing-status/route.ts     # Status checking endpoint
├── scripts/
│   └── start-claude-context.sh      # MCP server startup script
└── CLAUDE_CONTEXT_SETUP.md          # This file
```

## Troubleshooting

### Common Issues

1. **MCP Server Won't Start**
   - Check that all environment variables are set
   - Verify OpenAI API key is valid
   - Ensure Zilliz Cloud credentials are correct

2. **Repository Cloning Fails**
   - Check that the repository is public or you have access
   - Ensure git is installed and available in PATH

3. **Search Returns No Results**
   - Verify the repository was indexed successfully
   - Check the indexing status endpoint
   - Ensure the repository path is correct

### Debug Mode

To see detailed logs, check the console output when running:
```bash
pnpm run claude-context
```

## Configuration Options

### Embedding Models

You can use different embedding models by changing the environment variables:

```env
# OpenAI models
EMBEDDING_MODEL=text-embedding-3-small    # Fast, cost-effective
EMBEDDING_MODEL=text-embedding-3-large    # More accurate

# VoyageAI models (requires VOYAGEAI_API_KEY)
EMBEDDING_PROVIDER=VoyageAI
EMBEDDING_MODEL=voyage-3-large

# Gemini models (requires GEMINI_API_KEY)
EMBEDDING_PROVIDER=Gemini
EMBEDDING_MODEL=gemini-embedding-001
```

### File Inclusion/Exclusion

The MCP server automatically excludes common files like:
- `node_modules/`
- `.git/`
- `*.log`
- `dist/`
- `build/`

## Next Steps

1. **Test the Integration**: Select a repository and generate tickets
2. **Monitor Performance**: Check indexing times and search quality
3. **Customize**: Adjust embedding models and search parameters
4. **Scale**: Consider using multiple MCP servers for large codebases

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure the MCP server is running and accessible
4. Check the [Claude Context documentation](https://github.com/zilliztech/claude-context) for more details
