#!/usr/bin/env bash

git pull
pnpm i
pm2 restart mob-api
