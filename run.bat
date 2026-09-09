@echo off
title PeerSolve Academic Doubt Forum
cd /d "%~dp0"
echo ==========================================================
echo    🚀 Launching PeerSolve (Academic Q^&A Forum)
echo ==========================================================
echo Running on Node.js, Express, MySQL, HTML, CSS, and JS...
echo Starting server on http://localhost:5000 ...

start "" http://localhost:5000
node server.js
pause
