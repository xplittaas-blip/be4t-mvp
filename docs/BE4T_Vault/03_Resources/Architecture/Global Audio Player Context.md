---
aliases: [Audio Player, Reproductor, Contexto Global]
tags: [xplit, architecture, frontend, react, audio]
---

# 🎧 Global Audio Player Context

Historicamente la arquitectura de Xplit renderizaba un objeto HTML estricto `<audio>` por cada tarjeta en el `.map` del catálogo. Esto generaba problemas de superposición acústica si el usuario tocaba Play en dos tarjetas simultáneamente y rompía la escucha si el usuario cambiaba de página.

Se refactorizó todo hacia un **Provider Global**, que vive por encima de las rutas asincrónicas en la raíz del árbol de React (`main.jsx`).

## 🧱 Arquitectura Ténica

### 1. `GlobalPlayerContext.jsx`
Expone una variable ref hacia `new Audio()`. El contexto escucha eventos base como `timeupdate`, `ended` y `error` atados al ciclo de vida global, lo que permite despachar eventos de sincronía (play y progress bar) hacia cualquier componente hijo sin prop-drilling.

```javascript
// Métodos Clave Expuestos:
const {
   currentTrack, // Obj: Titulo, artista, imagen, preview_url
   isPlaying,    // Boolean global
   progress,     // Slider number
   playTrack,    // Override the Audio src and unpause
   togglePlay,   // Safe toggle mechanism
} = useGlobalPlayer();
```

### 2. `MiniPlayer.jsx`
Componente similar al sistema *Mobile/Desktop* de **Spotify**. Atrapado al `document.body` o directamente bajo `App.jsx`, no desaparece cuando ocurre validación via _react-router_ o cambios de estado primarios. 

## 🔗 Vinculaciones
Esta infraestructura se llama desde el embudo de conversión: [[Conversion Redesign Playbook]] y se renderiza en la rejilla calculada por el: [[Marketplace Momentum Score]].
