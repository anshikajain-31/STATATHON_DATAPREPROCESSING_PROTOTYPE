Write-Host "🚀 Starting Data Preparation Frontend..." -ForegroundColor Green
Write-Host "📍 Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend should be running at: http://localhost:8000" -ForegroundColor Yellow
Write-Host ""

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Yellow
npm start

Read-Host "Press Enter to exit"




