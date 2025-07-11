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

# Smoo starten
Start-Process $smoBatPath