#!/usr/bin/env bash

# git pull
# pnpm i
# pm2 delete event-scraper
pm2 start index.js --name event-scraper && pm2 save
