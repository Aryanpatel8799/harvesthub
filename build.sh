#!/bin/bash

# Clean install to avoid Rollup issues
rm -rf node_modules package-lock.json
npm install

# Build the project
npm run build 