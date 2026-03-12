@echo off
REM Truffle Quick Setup Script for Food Traceability System (Windows)
REM This script helps you set up Truffle with Ganache GUI

echo.
echo ============================================
echo   Truffle + Ganache Setup Script (Windows)
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo [OK] Node.js version:
node -v
echo.

REM Check if .env file exists
if not exist .env (
    echo [WARN] .env file not found. Copying from .env.example...
    copy .env.example .env >nul
    echo [OK] .env file created.
    echo.
    echo === IMPORTANT: Update your .env file ===
    echo Steps to get your mnemonic from Ganache:
    echo   1. Open Ganache GUI
    echo   2. Click QUICKSTART or create a NEW WORKSPACE
    echo   3. Click the key icon at the top right
    echo   4. Copy the 12-word mnemonic
    echo   5. Open .env file and update MNEMONIC=your words here
    echo.
    echo Press any key to continue after updating .env...
    pause >nul
) else (
    echo [OK] .env file exists
)

REM Install dependencies
echo.
echo [INFO] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

REM Check if Truffle is available
where truffle >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Truffle not found globally. Using npx...
    set TRUFFLE=npx truffle
) else (
    echo [OK] Truffle found
    set TRUFFLE=truffle
)

REM Compile contracts
echo.
echo [INFO] Compiling smart contracts...
call %TRUFFLE% compile
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed. Please check your contracts.
    pause
    exit /b 1
)
echo [OK] Contracts compiled successfully
echo.

REM Check if Ganache is running
echo [INFO] Checking if Ganache is running on port 7545...
netstat -an | findstr ":7545" | findstr "LISTENING" >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Ganache is running
    echo.
    
    REM Deploy contracts
    echo [INFO] Deploying contracts to Ganache...
    call %TRUFFLE% migrate --network development
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ============================================
        echo   SUCCESS! Contracts deployed successfully
        echo ============================================
        echo.
        echo Next steps:
        echo   1. Check contract-address.json for deployed address
        echo   2. Update CONTRACT_ADDRESS in .env file
        echo   3. Test blockchain integration: npm run test:blockchain
        echo.
        echo Setup complete! You're ready to develop!
        echo.
        pause
    ) else (
        echo [ERROR] Deployment failed. Check the error messages above.
        pause
        exit /b 1
    )
) else (
    echo [ERROR] Ganache is not running on port 7545
    echo.
    echo Please start Ganache GUI before deploying:
    echo   1. Open Ganache application
    echo   2. Click QUICKSTART or create a workspace
    echo   3. Verify it's running on port 7545 (Settings - Server)
    echo   4. Run this script again
    echo.
    pause
    exit /b 1
)
