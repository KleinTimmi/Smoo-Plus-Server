$pcName = $env:COMPUTERNAME

switch ($pcName) {
    "NEO-PC" {
        $smoBatPath = "C:\Games\Switch\Smoo\Bat\smo.bat"
    }
    "KleinTimmi" {
        $smoBatPath = "Pfad\anpassen\smo.bat"
    }
    default {
        Write-Host "Unbekannter Computername: $pcName"
        exit
    }
}

# Smoo starten
Start-Process $smoBatPath