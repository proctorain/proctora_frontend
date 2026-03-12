# Start Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

Write-Host "Waiting for Docker to start..."
Start-Sleep -Seconds 15

# Start Redis container
docker start redis-server 2>$null
if ($LASTEXITCODE -ne 0) {
    docker run -d --name redis-server -p 6379:6379 redis
}

# Open Windows Terminal with all tabs in a single wt call
$root = $PSScriptRoot

wt --title "API Gateway"  --startingDirectory "$root\backend\api-gateway"  powershell -NoExit -Command "npm run dev" `; `
   new-tab --title "Auth Service"   --startingDirectory "$root\backend\auth-services"  powershell -NoExit -Command "npm run dev" `; `
   new-tab --title "Quiz Service"   --startingDirectory "$root\backend\quiz-services"  powershell -NoExit -Command "npm run dev" `; `
   new-tab --title "Email Service"  --startingDirectory "$root\backend\email-services" powershell -NoExit -Command "npm run dev" `; `
   new-tab --title "Frontend"       --startingDirectory "$root\frontend"               powershell -NoExit -Command "npm run dev"