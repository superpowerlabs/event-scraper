#!/usr/bin/env bash

FILE=src/config/deployed.json
if [[ -f "$FILE" ]]; then
    echo "deployed.json exists."
else
    echo "{}" > $FILE
fi

FILE=synr-seed/export/deployed.json
if [[ -f "$FILE" ]]; then
    echo "deployed.json exists."
else
    mkdir synr-seed/export
    echo "{}" > $FILE
fi
