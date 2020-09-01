#!/usr/bin/env node

const shell = require('shelljs');
const path = require('path');

shell.exec(`npm run start --prefix ${path.dirname(__dirname)} start`);