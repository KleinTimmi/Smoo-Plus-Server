$pcName = $env:COMPUTERNAME

switch ($pcName) {
    "NEO-PC" {
        $serverPath = "C:\Users\Sam\Documents\GitHub\Smoo_aaaaaaa\SmoOnlineServer-master\Server\bin\Debug\net6.0\Server.exe"
    }
    "KleinTimmi" {
        $serverPath = "Pfad\anpassen\server.exe"
    }
    default {
        Write-Host "Unbekannter Computername: $pcName"
        exit
    }
}

# Server stoppen, neu bauen und starten
taskkill /IM Server.exe /F
dotnet publish "SmoOnlineServer-master/SmoMultiplayerServer.sln" 
Start-Process $serverPath
