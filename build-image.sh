#!/bin/bash
git pull
rm -rf dist
rm -rf node_modules
pnpm install && pnpm dlx update-browserslist-db@latest && docker build -t planning-poker:latest .
