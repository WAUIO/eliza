#!/bin/bash
# Add this line to ensure script stops on errors
set -eo pipefail

docker login ghcr.io -u $GH_USER -p $GHCR_TOKEN
docker-compose -f docker-compose.demo.yml pull
docker-compose -f docker-compose.demo.yml up -d --force-recreate