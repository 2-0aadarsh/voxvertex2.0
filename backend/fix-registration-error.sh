#!/bin/bash

echo "========================================"
echo "   Fix Enhanced Event Registration Error"
echo "========================================"
echo ""
echo "This script will fix the duplicate key error"
echo "in the enhanced event registration system."
echo ""
echo "Error being fixed:"
echo "E11000 duplicate key error collection: test.enhancedeventregistrations"
echo "index: registrationId_1 dup key: { registrationId: null }"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

echo ""
echo "Running database maintenance script..."
node fix-duplicate-key-error.js

echo ""
echo "Press Enter to exit..."
read


