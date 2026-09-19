@echo off
title CivicReport Server
cd /d "%~dp0backend"
echo ===================================================
echo ?? Starting CivicReport Backend Server...
echo ?? Application URL: http://localhost:3000
echo ===================================================
node app.js
pause