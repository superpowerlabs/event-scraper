#!/usr/bin/env bash

git pull
pm2 delete core-pool-volumes
pm2 start scripts/getVolumes.js --name core-pool-volumes && pm2 save
