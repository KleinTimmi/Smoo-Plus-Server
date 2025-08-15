# PowerShell-Skript zum Einrichten der Firewall-Regel für das SMOO Webinterface
# Führen Sie dieses Skript als Administrator aus

Write-Host "Erstelle Firewall-Regel für SMOO Webinterface (Port 8080)..." -ForegroundColor Green

# Prüfen ob bereits eine Regel existiert
$existingRule = Get-NetFirewallRule -DisplayName "SMOO Webinterface" -ErrorAction SilentlyContinue

if ($existingRule) {
    Write-Host "Firewall-Regel existiert bereits. Entferne alte Regel..." -ForegroundColor Yellow
    Remove-NetFirewallRule -DisplayName "SMOO Webinterface"
}

# Neue Firewall-Regel erstellen
New-NetFirewallRule -DisplayName "SMOO Webinterface" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 8080 `
    -Action Allow `
    -Profile Any `
    -Description "Erlaubt Zugriff auf das SMOO Webinterface über Port 8080"

Write-Host "Firewall-Regel erfolgreich erstellt!" -ForegroundColor Green
Write-Host "Das Webinterface sollte jetzt über Ihr lokales Netzwerk erreichbar sein." -ForegroundColor Cyan
Write-Host "Verwenden Sie: http://IHRE_IP_ADRESSE:8080/dashboard.html" -ForegroundColor Cyan

# IP-Adresse anzeigen
Write-Host "`nIhre lokalen IP-Adressen:" -ForegroundColor Yellow
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*"} | ForEach-Object {
    Write-Host "  http://$($_.IPAddress):8080/dashboard.html" -ForegroundColor White
}
