#! /bin/bash

pnpm build \
    --filter "@elizaos/core" \
    --filter "@elizaos/adapter-postgres" \
    --filter "@elizaos/adapter-redis" \
    --filter "@elizaos/adapter-sqlite" \
    --filter "@elizaos/adapter-pglite" \
    --filter "@elizaos/client-auto" \
    --filter "@elizaos/client-discord" \
    --filter "@elizaos/client-twitter" \
    --filter "@elizaos/client-direct" \
    --filter "@elizaos/plugin-image-generation" \
    --filter "@elizaos/plugin-node" \
    --filter "@elizaos/plugin-sgx" \
    --filter "@elizaos/plugin-solana" \
    --filter "@elizaos/plugin-tee" \
    --filter "@elizaos/plugin-tee-log" \
    --filter "@elizaos/plugin-twitter" \
    --filter "@elizaos/plugin-trustdb" \
    --filter "@elizaos/agent" \
    --filter "client"
