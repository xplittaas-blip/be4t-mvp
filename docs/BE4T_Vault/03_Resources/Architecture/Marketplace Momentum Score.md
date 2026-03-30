---
aliases: [Momentum, Trending Score, Traction algorithm]
tags: [xplit, algorithm, backend, frontend, marketplace]
---

# 📈 Marketplace Momentum Score

El "Momentum Score" surge de la necesidad de mostrar a los usuarios tracción predictiva y señales de crecimiento (FOMO) a un golpe de vista sin esperar una validación extensa.

Para determinar en `Marketplace.jsx` qué canciones van a la parte superior de la navegación cuando el pre-filtro es `"Trending"`, diseñamos una puntuación de peso combinado (100 Base Score Max).

## ⚖️ Distribución de Pesos (Algoritmo 40-30-20-10)

| Métrica Cruda (API) | Ponderación (%) | Normalización y Cálculo Interno |
| :------------------ |:--------------:| :----------------------------- |
| **Spotify Popularity** | 40% | Es un índice propio de Spotify de 0 a 100. Se usa directo: `(pop / 100) * 40`. |
| **YouTube Views**      | 30% | Se escala dividiendo asumiendo que 10M es "viralidad media superior": `min(100, (views / 10,000,000) * 100)`. |
| **TikTok Creations**   | 20% | Se genera simulado a un ratio dinámico desde los Spotify Streams (aprox 5% al 20%). Validado a tope de 1M. |
| **Velocidad de Crecimiento** | 10% | Se inyecta un mock dinámico (% crecimiento por sumatorio del Seed ID) topado a `+30% = 10pts`. |

### Flujo Crítico de Inyección (Frontend)

Actualmente implementado puramente visual, se realiza mediante el iterador de objeto en Javascript:

```javascript
const enrichSongData = (song) => {
   // La semilla genera un dato determinista pseudo-aleatorio para consistencia visual entre renderizados.
   const seed = song.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
   // ... [Math]
   return { ...song, momentum_score: score };
}
```

## 🔗 Referencias
- Se exhibe directamente bajo los lineamientos visuales trazados en: [[Tone and Voice]]
- Es el principal imán de leads para convertir ventas dentro del: [[Conversion Redesign Playbook]]
