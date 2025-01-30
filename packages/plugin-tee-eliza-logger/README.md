# TEE Eliza Logger Plugin

Integrates elizaLogger with the TEE logging system for verifiable logging of all Eliza's log outputs.

## Features

- Intercepts and persists all elizaLogger outputs (info, error, warn, etc.)
- Provides enhanced log querying with:
  - Timestamp-based ordering (asc/desc)
  - Cursor-based pagination
  - Efficient caching
  - Input validation

## Installation

```bash
pnpm add @elizaos/plugin-tee-eliza-logger
```

## Configuration

Add to character.json:

```json
{
    "plugins": ["@elizaos/plugin-tee-eliza-logger"],
    "settings": {
        "teeLog": {
            "enabled": true
        }
    }
}
```

## Usage

### Basic Log Querying

```typescript
import { ServiceType } from "@elizaos/core";
import { IEnhancedTeeLogService } from "@elizaos/plugin-tee-eliza-logger";

// Get the enhanced log service
const logService = runtime
    .getService<IEnhancedTeeLogService>(ServiceType.TEE_LOG_ENHANCED)
    .getInstance();

// Get latest logs (descending order)
const latestLogs = await logService.getOrderedLogs(
    { orderBy: "desc" },
    1,  // page
    50  // pageSize
);

// Get logs before a specific timestamp
const olderLogs = await logService.getOrderedLogs(
    {
        orderBy: "desc",
        cursorTimestamp: 1234567890
    },
    1,
    50
);
```

### Cursor-based Navigation

The service returns cursor metadata for easy navigation:

```typescript
const response = await logService.getOrderedLogs(
    { orderBy: "desc" },
    1,
    50
);

// Get next page using the cursor
if (response.cursor.next) {
    const nextPage = await logService.getOrderedLogs(
        {
            orderBy: "desc",
            cursorTimestamp: response.cursor.next
        },
        1,
        50
    );
}
```

### Error Handling

The service includes built-in validation:

```typescript
try {
    const logs = await logService.getOrderedLogs(
        { orderBy: "desc" },
        1,
        50
    );
} catch (error) {
    if (error instanceof ValidationError) {
        console.error('Invalid input:', error.message);
    } else {
        console.error('Failed to fetch logs:', error);
    }
}
```

## Development

For local development:

```json
{
    "plugins": ["../../packages/plugin-tee-eliza-logger/src/index.ts"]
}
```

## Limitations

- Maximum page size is 100 logs per request
- Cache TTL is set to 5 seconds
- Ordering is done in memory for compatibility with existing storage

## License

This plugin is part of the Eliza project. See the main project repository for license information.
