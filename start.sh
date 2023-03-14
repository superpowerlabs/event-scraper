#!/usr/bin/env bash

# git pull
# pnpm i
# pm2 delete event-scraper
pm2 start ./indexingService.js --name event-scraper && pm2 save