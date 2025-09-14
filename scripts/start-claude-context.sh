#!/bin/bash

# Start Claude Context MCP Server
# This script starts the Claude Context MCP server with the required environment variables

echo "Starting Claude Context MCP Server..."

# Check if required environment variables are set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "Error: OPENAI_API_KEY environment variable is not set"
    echo "Please set it in your .env.local file or export it:"
    echo "export OPENAI_API_KEY=your_openai_api_key_here"
    exit 1
fi

if [ -z "$MILVUS_TOKEN" ]; then
    echo "Error: MILVUS_TOKEN environment variable is not set"
    echo "Please set it in your .env.local file or export it:"
    echo "export MILVUS_TOKEN=your_zilliz_cloud_token_here"
    exit 1
fi

# Set default values for optional environment variables
export EMBEDDING_PROVIDER=${EMBEDDING_PROVIDER:-"OpenAI"}
export EMBEDDING_MODEL=${EMBEDDING_MODEL:-"text-embedding-3-small"}
export MCP_SERVER_PORT=${MCP_SERVER_PORT:-3001}

echo "Configuration:"
echo "  Embedding Provider: $EMBEDDING_PROVIDER"
echo "  Embedding Model: $EMBEDDING_MODEL"
echo "  MCP Server Port: $MCP_SERVER_PORT"
echo "  Milvus Address: ${MILVUS_ADDRESS:-'Auto-resolved from token'}"

# Start the MCP server
echo "Starting MCP server..."
npx @zilliz/claude-context-mcp@latest
