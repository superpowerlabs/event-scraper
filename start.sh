#!/usr/bin/env bash

pnpm i
pm2 start index.js -i max --name mob-api && pm2 save
