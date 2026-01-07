#!/bin/bash
# Quick script to clean up all Cosmos DB and Node.js references

# This script replaces old references in documentation files
# Run from project root: bash cleanup-docs.sh

echo "Cleaning up documentation references..."

# Define files to update
FILES=(
  "README.md"
  "TERMINAL_COMMANDS.md"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Create backup
    cp "$file" "${file}.bak"
    
    # Replace Cosmos DB references
    sed -i 's/Cosmos DB/Table Storage/g' "$file"
    sed -i 's/cosmos DB/Table Storage/g' "$file"
    sed -i 's/CosmosDB/TableStorage/g' "$file"
    sed -i 's/DisasterDB/Alerts/g' "$file"
    sed -i 's/@azure\/cosmos/azure-data-tables/g' "$file"
    
    # Replace Node.js references
    sed -i 's/Node\.js v4/Python 3.11/g' "$file"
    sed -i 's/Node\.js 18/Python 3.11/g' "$file"
    sed -i 's/node\.js/python/g' "$file"
    
    echo "✓ Updated $file"
  fi
done

echo "Done! Backup files created with .bak extension"
