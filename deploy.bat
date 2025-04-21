@echo off
echo PICC Online Inventory Management System - Deployment Helper

REM Build the client
echo Building client...
cd client
call npm install
call npm run build
echo Client build complete!

REM Back to project root
cd ..

REM Build the API
echo Building API...
cd api
call npm install
echo API build complete!

echo Deployment files are ready!
echo - Client: ./client/dist
echo - API: ./api

echo You can now deploy these files to your hosting service.
echo For Render.com deployment, use the render.yaml file in the client directory.

pause 