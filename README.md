# 🧩 Jigsolitaire

Un juego de rompecabezas moderno y adictivo con mecánica única de fusión de piezas.

## ✨ Características

- **Mecánica de Fusión Única**: Las piezas correctas se fusionan automáticamente al juntarse
- **20 Niveles**: Desde 3x3 hasta 4x3 piezas
- **Progressive Web App (PWA)**: Instalable en móviles y escritorio
- **Diseño Moderno**: Interfaz elegante con animaciones fluidas
- **Funciona Offline**: Juega sin conexión después de la primera carga
- **Sistema de Progreso**: Guarda tu avance automáticamente

## 🎮 Cómo Jugar

1. Selecciona un nivel desbloqueado
2. Haz clic en una pieza para seleccionarla (se resalta en dorado)
3. Haz clic en otra pieza para intercambiarlas
4. Cuando dos piezas correctas se juntan, ¡se fusionan automáticamente!
5. Las piezas fusionadas se mueven como un grupo
6. Completa la imagen para ganar

## 🚀 Instalación y Desarrollo

### Requisitos
- Node.js 18 o superior
- npm o yarn

### Pasos

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar servidor de desarrollo:
```bash
npm run dev
```

3. Abrir en el navegador:
```
http://localhost:5173
```

## 📦 Build para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`.

## 🌐 Desplegar como PWA

1. Sube la carpeta `dist/` a tu hosting (Netlify, Vercel, GitHub Pages, etc.)
2. La aplicación será automáticamente instalable en dispositivos móviles
3. Los usuarios podrán jugar offline después de la primera visita

## 🎨 Personalización

### Cambiar Colores
Edita las variables de color en `src/App.css` y los componentes.

### Agregar Niveles
Edita `src/data/levels.js` y agrega nuevos niveles al array `LEVELS`.

### Modificar Tamaño de Grid
Cambia la propiedad `gridSize` en los niveles (3 = 3x3, 4 = 4x4, etc.)

## 🛠️ Tecnologías

- **React 18**: Framework UI
- **Vite**: Build tool ultra-rápido
- **Framer Motion**: Animaciones fluidas
- **PWA**: Instalable y offline-first
- **LocalStorage**: Persistencia de progreso

## 📱 Compatibilidad

- ✅ Chrome/Edge (móvil y escritorio)
- ✅ Safari (iOS y macOS)
- ✅ Firefox
- ✅ Samsung Internet
- ✅ Opera

## 📝 Licencia

Este proyecto es de código abierto. Siéntete libre de usarlo y modificarlo.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 🎯 Roadmap

- [ ] Modo multijugador
- [ ] Más categorías de imágenes
- [ ] Tabla de clasificación global
- [ ] Modo diario con desafío único
- [ ] Sistema de logros
- [ ] Pistas opcionales
- [ ] Música de fondo
- [ ] Efectos de sonido

---

¡Disfruta el juego! 🎉
