#!/bin/bash

# Release jsep and all packages (dependent on what changes were made where)
# To test, run command ./release.sh --debug --no-cli --dry-run
# (or npm run release -- --debug --no-cli --dry-run)

echo "Semantic-Release JSEP"
pnpx semantic-release "$@"

packages=($(ls -d packages/*))
for package in "${packages[@]}"; do
  printf "\n\nSemantic-Release $package\n"
  (cd $package && pwd && pnpx semantic-release -e semantic-release-monorepo "$@")
done
