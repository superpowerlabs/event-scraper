#!/usr/bin/env bash

# starts the monitor as a PM2 process
git pull
pnpm i
pm2 delete event-scraper
pm2 delete event-monitor
pm2 start monitor.js --name event-monitor
pm2 delete event-recover
pm2 start recover.js --name event-recover
pm2 save
