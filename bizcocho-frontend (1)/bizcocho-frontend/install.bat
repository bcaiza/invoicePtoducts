@echo off
echo ================================
echo Bizcocho Frontend - Instalacion
echo ================================
echo.

echo [1/3] Instalando dependencias...
call npm install

echo.
echo [2/3] Creando archivo .env...
if not exist .env (
    copy .env.example .env
    echo Archivo .env creado. Configuralo si es necesario.
) else (
    echo Archivo .env ya existe.
)

echo.
echo [3/3] Instalacion completada!
echo.
echo Para iniciar el servidor de desarrollo, ejecuta:
echo   npm run dev
echo.
pause
