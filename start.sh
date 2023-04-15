#!/usr/bin/env bash

# starts the monitor as a PM2 process
git pull
pnpm i
pm2 delete event-scraper
pm2 start monitor.js --name event-scraper
pm2 save
