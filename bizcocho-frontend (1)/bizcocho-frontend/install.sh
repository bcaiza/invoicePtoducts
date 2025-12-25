#!/bin/bash

echo "================================"
echo "Bizcocho Frontend - Instalación"
echo "================================"
echo ""

echo "[1/3] Instalando dependencias..."
npm install

echo ""
echo "[2/3] Creando archivo .env..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Archivo .env creado. Configúralo si es necesario."
else
    echo "Archivo .env ya existe."
fi

echo ""
echo "[3/3] ¡Instalación completada!"
echo ""
echo "Para iniciar el servidor de desarrollo, ejecuta:"
echo "  npm run dev"
echo ""
