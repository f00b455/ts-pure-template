#!/bin/bash

# Script to verify that all feature files have proper issue references
# This is called from CI but can also be run locally

echo "Checking feature files for issue references..."
REPO="${GITHUB_REPOSITORY:-f00b455/ts-pure-template}"
ERR=0

# Find all feature files in all packages
while IFS= read -r -d '' f; do
  echo "Checking $f"

  # Check for Issue comment
  if ! head -n 5 "$f" | grep -qE "^#\s*Issue:\s*#\d+"; then
    echo "::error file=$f::Missing 'Issue: #<num>' comment"
    ERR=1
  fi

  # Check for URL comment
  if ! head -n 5 "$f" | grep -qE "^#\s*URL:\s*https://github.com/${REPO}/issues/\d+"; then
    echo "::error file=$f::Missing canonical URL comment"
    ERR=1
  fi

  # Check for issue tag
  if ! head -n 10 "$f" | grep -qE "^@.*\bissue-\d+\b"; then
    echo "::error file=$f::Missing '@issue-<num>' tag"
    ERR=1
  fi
done < <(find . -name "*.feature" -path "*/features/*" -print0)

if [ $ERR -eq 0 ]; then
  echo "✅ All feature files have valid issue references"
else
  echo "❌ Some feature files are missing issue references"
  exit $ERR
fi