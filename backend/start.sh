#!/bin/bash

# Start backend server with 1Password environment variables
# This script uses 'op run' to load secrets from 1Password before starting the server

echo "Starting YT-Transcribe backend with 1Password secrets..."

# Check if 1Password CLI is installed
if ! command -v op &> /dev/null; then
    echo "Error: 1Password CLI (op) is not installed."
    echo "Please install it from: https://developer.1password.com/docs/cli/get-started/"
    exit 1
fi

# Check if user is signed in to 1Password CLI
if ! op account list &> /dev/null; then
    echo "Error: Not signed in to 1Password CLI."
    echo "Please run: op signin"
    exit 1
fi

# Run the server with 1Password environment variables
op run --env-file .env -- python run.py