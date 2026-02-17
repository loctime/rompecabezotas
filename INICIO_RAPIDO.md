# 🚀 Inicio Rápido - Jigsolitaire

## Opción 1: Script Automático (Linux/Mac)

```bash
./start.sh
```

## Opción 2: Manual

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Iniciar Desarrollo
```bash
npm run dev
```

### 3. Abrir en Navegador
Abre http://localhost:5173 en tu navegador

## 📦 Build para Producción

```bash
npm run build
```

Los archivos estarán en la carpeta `dist/`

## 🌐 Desplegar

### Netlify (Recomendado)
1. Arrastra la carpeta `dist/` a https://app.netlify.com/drop
2. ¡Listo!

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### GitHub Pages
1. Sube el contenido de `dist/` a la rama `gh-pages`
2. Activa GitHub Pages en la configuración del repositorio

## 🔧 Solución de Problemas

### Error: "command not found: npm"
- Instala Node.js desde https://nodejs.org/

### Error: "Cannot find module"
- Ejecuta `npm install` de nuevo

### La página no carga
- Verifica que el servidor esté corriendo en http://localhost:5173
- Revisa la consola del navegador para errores

### Las imágenes no cargan
- Verifica tu conexión a internet (usa Unsplash API)
- Las imágenes se cargan desde CDN externo

## 💡 Tips

- Usa `npm run dev` para desarrollo con hot reload
- Usa `npm run build` solo cuando quieras desplegar
- El juego guarda el progreso automáticamente en localStorage
- Funciona offline después de la primera carga

## 📞 Soporte

Si encuentras problemas:
1. Verifica que Node.js esté instalado: `node --version`
2. Verifica que npm esté instalado: `npm --version`
3. Limpia caché: `rm -rf node_modules && npm install`
4. Revisa la consola del navegador (F12)

---

¡Diviértete jugando! 🎮
