@echo off
echo Building frontend...
cd frontend
npm run build
cd ..

echo Copying build files to root dist...
if exist dist rmdir /s /q dist
mkdir dist
xcopy /s /e frontend\dist\* dist\

echo Build completed successfully!
