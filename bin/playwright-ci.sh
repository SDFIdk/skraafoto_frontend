#!/bin/bash

# Copy the 'test' folder and playwright config to the parent directory
cp playwright.config.js ../
cp -r test ../

# Change to the parent directory
cd ..

# Run the Playwright tests
npx playwright test