@echo off
echo Cleaning up unnecessary files...

REM Remove test files
if exist test_image.jpg del test_image.jpg
if exist test_api.py del test_api.py
if exist test_image_gen.py del test_image_gen.py

REM Remove temporary files
if exist frontend\install-deps.bat del frontend\install-deps.bat

REM Remove root node_modules (not needed)
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

REM Fix Git submodule issue
if exist frontend\.git rmdir /s /q frontend\.git

echo Fixing Git repository...
git rm --cached frontend 2>nul
git add .
git reset HEAD frontend/.git 2>nul

echo Cleanup completed!
echo Now run: git add . && git commit -m "cleanup and deploy" && git push
