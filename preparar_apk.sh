#!/bin/bash

# Script para preparar la aplicación para Android
echo "🚀 Iniciando la preparación de la APK..."

# 1. Compilar la aplicación web
echo "📦 Compilando la aplicación web (React/Vite)..."
npm run build

# 2. Sincronizar con el proyecto de Android
echo "🔄 Sincronizando con Capacitor Android..."
npx cap sync android

echo "✅ ¡Preparación completada!"
echo "--------------------------------------------------"
echo "PASOS FINALES EN ANDROID STUDIO:"
echo "1. Abre la carpeta 'android' en Android Studio."
echo "2. Ve al menú 'Build' > 'Build Bundle(s) / APK(s)' > 'Build APK(s)'."
echo "3. Una vez termine, verás un aviso con un enlace 'locate' para encontrar tu archivo APK."
echo "--------------------------------------------------"
echo "NOTA: Asegúrate de haber puesto tus IDs oficiales de AdMob en:"
echo "- capacitor.config.ts (App ID)"
echo "- src/App.tsx (Banner e Interstitial IDs)"
echo "--------------------------------------------------"
