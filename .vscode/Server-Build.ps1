$pcName = $env:COMPUTERNAME

switch ($pcName) {
    "NEO-PC" {
        $serverPath = "C:\Users\Sam\Documents\GitHub\Smoo-Plus-Server\Server\bin\Debug\net6.0\Server.exe"
    }
    "DESKTOP-0M36AO4" {
        $serverPath = "G:\exefs\Server\bin\Debug\net6.0\Server.exe"
    }
    default {
        Write-Host "Unbekannter Computername: $pcName"
        exit
    }
}

# Server stoppen, neu bauen und starten
taskkill /IM Server.exe /F
dotnet build "SmoMultiplayerServer.sln" 
Start-Process $serverPath
