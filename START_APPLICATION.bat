@echo off
title Hey Joe - Lancement de l'application
color 0A

echo ========================================
echo    HEY JOE - RETAIL ANALYTICS
echo    Demarrage de l'application...
echo ========================================
echo.

:: Verification de Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERREUR] Node.js n'est pas installe !
    echo.
    echo Veuillez installer Node.js depuis : https://nodejs.org/
    echo Choisissez la version LTS ^(Long Term Support^)
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detecte :
node --version
echo.

:: Se deplacer dans le dossier client
cd /d "%~dp0client"

:: Verification de l'installation
if not exist "node_modules\" (
    echo [INFO] Premiere installation - Installation des dependances...
    echo Ceci peut prendre 2-3 minutes...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo [ERREUR] L'installation a echoue !
        pause
        exit /b 1
    )
)

:: Lancement de l'application
echo.
echo ========================================
echo    LANCEMENT DE L'APPLICATION
echo ========================================
echo.
echo L'application va demarrer sur : http://localhost:5173
echo.
echo INSTRUCTIONS :
echo   1. Attendez que votre navigateur s'ouvre automatiquement
echo   2. Si le navigateur ne s'ouvre pas, allez sur : http://localhost:5173
echo   3. Pour arreter l'application, fermez cette fenetre
echo.
echo ========================================
echo.

:: Attendre 3 secondes puis ouvrir le navigateur
start /B cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

:: Lancer le serveur de developpement
call npm run dev

:: Si le serveur s'arrete
echo.
echo L'application s'est arretee.
pause
