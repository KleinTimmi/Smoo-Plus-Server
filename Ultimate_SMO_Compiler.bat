@echo off
title Ultimate SMO Compiler
color 0A

echo Willkommen zum Ultimate SMO Compiler!
echo Was moechtest du tun?
echo [1] Nur Starten
echo [2] Compilen + Starten
echo [3] Clean, Compilen + Starten
echo [4] Nur Compilen
echo [5] Beenden
echo.

set /p choice=Deine Auswahl (1/2/3/4/5): 

if "%choice%"=="1" goto Start_Game
if "%choice%"=="2" goto CompileStart
if "%choice%"=="3" goto CleanCompileStart
if "%choice%"=="4" goto Compile
if "%choice%"=="5" goto End
if "%choice%"=="q" goto End

echo Ungültige Auswahl. Bitte erneut starten.
goto End

:CompileStart
echo ---- WSL wird gestartet und kompiliert...
echo Bitte warten...
ping localhost -n 3 >nul
wsl -d Ubuntu-22.04 bash -c "cd /mnt/g/exefs/SuperMarioOdysseyOnline && DEVKITPRO=/opt/devkitpro make"
goto Start_Game
goto End

:CleanCompileStart
echo ---- Reinigung...
wsl -d Ubuntu-22.04 bash -c "cd /mnt/g/exefs/SuperMarioOdysseyOnline && make clean && DEVKITPRO=/opt/devkitpro make"
goto Start_Game


:Compile
wsl -d Ubuntu-22.04 bash -c "cd /mnt/g/exefs/SuperMarioOdysseyOnline && DEVKITPRO=/opt/devkitpro make"
"C:\Users\Jens\Desktop\smo.bat"
goto End


:Start_Game
echo ---- Starte Super Mario Odyssey...
"C:\Users\Jens\Desktop\Switch.bat"

:End
echo.
echo Programm beendet. Bis bald!
exit 