#!/usr/bin/env bash

./generate-missing-deployed-json.sh

if [[ "$1" != "" ]]; then
  cd synr-seed
  NODE_ENV=test ./bin/deploy-for-tests.sh
  cd ..
fi

node_modules/.bin/mocha server/test/*.test.js --exit
