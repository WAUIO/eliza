# TEE Eliza Logger Plugin

Integrates elizaLogger with the TEE logging system for verifiable logging of all Eliza's log outputs.

## Background

This plugin bridges elizaLogger with the TEE logging system, ensuring all log outputs are:
- Securely stored in TEE
- Verifiable through remote attestation
- Tamper-resistant
- Automatically synchronized

## Usage

1. Install:

```bash
pnpm add @elizaos/plugin-tee-eliza-logger
```

2. Add to character.json    :

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


## Development

For local development:

```json
{
    "plugins": ["../../packages/plugin-tee-eliza-logger/src/index.ts"]
}
```
