#!/bin/bash
set -ev
if [[ $( git diff --name-only HEAD~1..HEAD webpack/ .travis.yml babel.config.js .eslintrc package.json | wc -l ) -ne 0 ]]; then
  npm ls @theforeman/test;
  npm run test;
  npm run publish-coverage;
  npm run lint;
fi
