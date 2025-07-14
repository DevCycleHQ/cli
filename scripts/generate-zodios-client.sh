#!/bin/bash
url="https://api.devcycle.com/swagger.json"
temp_file=$(mktemp)
curl -s "$url" -o "$temp_file"
yarn openapi-zod-client "$temp_file" --with-alias --export-schemas --prettier "prettier.config.js" -o "src/api/zodClient.ts"
rm "$temp_file"