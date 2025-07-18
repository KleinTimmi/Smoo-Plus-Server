$pcName = $env:COMPUTERNAME

switch ($pcName) {
    "NEO-PC" {
        $smoBatPath = "C:\Games\Switch\Smoo\Bat\smo.bat"
    }
    "DESKTOP-0M36AO4" {
        $smoBatPath = "C:\Users\Jens\Desktop\smo.bat"
    }
    default {
        Write-Host "Unbekannter Computername: $pcName"
        exit
    }
}

# Smoo starten und Schließen 
Get-Process | Where-Object { $_.MainWindowTitle -like "*Ultimate SMO Compiler*" } | ForEach-Object { $_.CloseMainWindow() }
Start-Process $smoBatPath