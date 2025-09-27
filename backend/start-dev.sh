#!/bin/bash

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please update the .env file with your actual values"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Start development server
echo "Starting development server..."
npm run start:dev