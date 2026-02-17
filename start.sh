#!/bin/bash

echo "🧩 Iniciando Jigsolitaire..."
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detectado: $(node --version)"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencias instaladas correctamente"
    echo ""
    echo "🚀 Iniciando servidor de desarrollo..."
    echo ""
    npm run dev
else
    echo ""
    echo "❌ Error al instalar dependencias"
    exit 1
fi
