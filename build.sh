#!/bin/bash

# Clean install to avoid Rollup issues
echo "Cleaning previous installation..."
rm -rf node_modules package-lock.json

# Install dependencies with npm
echo "Installing dependencies with npm..."
npm install

# If npm build fails, try with bun
echo "Building with npm..."
if npm run build; then
    echo "Build successful with npm!"
else
    echo "npm build failed, trying with bun..."
    # Install bun if not available
    if ! command -v bun &> /dev/null; then
        curl -fsSL https://bun.sh/install | bash
        export PATH="$HOME/.bun/bin:$PATH"
    fi
    
    # Clean and install with bun
    rm -rf node_modules package-lock.json
    bun install
    
    # Build with bun
    bun run build
fi 