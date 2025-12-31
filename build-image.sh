#!/bin/bash
git pull
rm -rf dist/*
rm -rf node_modules/*
npm install && npx update-browserslist-db@latest && docker build -t planning-poker:latest .
