@echo off
title Skillcraft Platform Launcher - SIH26202
echo =======================================================
echo   Skillcraft - Student Skill Discovery Platform
echo   Team Skillcraft ^| ANITS ^| Problem ID: SIH26202
echo =======================================================
echo.
echo [1/2] Starting Unified FastAPI Backend on port 8000...
start "Skillcraft Backend (:8000)" cmd /k "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"

echo [2/2] Starting Frontend on port 5173...
start "Skillcraft Frontend (:5173)" cmd /k "cd frontend && npm run dev -- --host 0.0.0.0 --port 5173"

echo.
echo All services launched!
echo Access the platform at:
echo   - On this PC:    http://localhost:5173
echo   - Backend Docs:  http://localhost:8000/docs
echo =======================================================
pause
