@echo off
title IoTGuard Dashboard
echo Starting IoTGuard Dashboard...
echo Backend will serve on http://localhost:3000
python -m uvicorn backend.main:app --host 0.0.0.0 --port 3000 --reload
pause
