#!/bin/bash

cd packages/client-telegram
git pull origin wau/main

cd ../../

pnpm clean && git restore pnpm-lock.yaml && pnpm install && pnpm build

pm2 reload ecosystem.config.js
pm2 save