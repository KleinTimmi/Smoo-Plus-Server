$pcName = $env:COMPUTERNAME

switch ($pcName) {
    "NEORIX" {
        $serverPath = "C:\Users\Neorix\Documents\GitHub\SmoOnlineServer-master\Server\bin\Debug\net6.0\Server.exe"
        $smoBatPath = "C:\Games\Switch\Smoo\Bat\smo.bat"
    }
    "KleinTimmi" {
        $serverPath = "Pfad\anpassen\server.exe"
        $smoBatPath = "Pfad\anpassen\smo.bat"
    }
    default {
        Write-Host "Unbekannter Computername: $pcName"
        exit
    }
}

# Server stoppen, neu bauen und starten
taskkill /IM Server.exe /F
dotnet build "SmoOnlineServer-master/SmoMultiplayerServer.sln"
Start-Process $serverPath

# Smoo starten
Start-Process $smoBatPath