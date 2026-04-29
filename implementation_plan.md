# 💎 Plan de Evolución: Fan Perks (Tier System)

Este plan detalla la reestructuración del motor de beneficios para adoptar un modelo de "Bóveda" de 3 Niveles (Tiers) con estética 'Berlin Underground', y mejoras de persuasión visual en las tarjetas del Marketplace.

## Cambios Propuestos

### 1. Refactor del Schema de Datos (`src/data/fallbackSongs.json`)
Ejecutaremos un nuevo script en Python para actualizar el array `perks` en todas las canciones hacia la estructura avanzada de 3 niveles:
```json
"perks": [
  { "min_tokens": 50, "label": "Preventa VIP", "description": "Acceso anticipado a boletería de la próxima gira.", "icon": "🎟️", "category": "Boletería" },
  { "min_tokens": 150, "label": "Merch Limitado", "description": "Gorra o Hoodie exclusivo para holders.", "icon": "🧢", "category": "Merch" },
  { "min_tokens": 500, "label": "Studio Session", "description": "Acceso detrás de escena o Meet & Greet virtual.", "icon": "🎧", "category": "Experiencia" }
]
```

### 2. UI: El 'Abre Bocas' (`src/components/be4t/SongCard.jsx`)
Para aumentar la conversión y el valor percibido desde el feed principal:
- **[MODIFY]** Añadiremos un badge `PERKS DISPONIBLES` superpuesto en la tarjeta.
- **[MODIFY]** Debajo del nombre del artista insertaremos el texto luminoso: `🎁 Desbloquea: Preventa VIP + Merch Exclusivo`.
- **[MODIFY]** Colocaremos indicadores `BLUE CHIP` (si APY >= 15%) y `HOT` (si las reproducciones superan 1M) sobre el cover art, usando un diseño glassmorphism.

### 3. UI: 'Benefits Vault' (`src/components/be4t/BenefitCard.jsx` & `SongDetail.jsx`)
- **[MODIFY] `SongDetail.jsx`:** Cambiaremos el título simple por "🎉 BÓVEDA DE BENEFICIOS DEL ARTISTA". Contendrá una rejilla (`grid-cols-1 md:grid-cols-3`) para que los 3 Tiers se muestren lado a lado como pilares de inversión.
- **[MODIFY] `BenefitCard.jsx`:** Pasará de ser una franja horizontal a una tarjeta vertical tipo pilar.
  - *Estado Bloqueado:* Escala de grises, opacidad baja, texto "Invierte X tokens más para desbloquear".
  - *Estado Desbloqueado:* Gradiente de fondo oscuro (`bg-[#0c0c0c]`), borde brillante (`border-[#00FFCC]`), efecto `box-shadow` pulsante y botón "RECLAMAR BENEFICIO".
  - *Feedback:* Integraré un micro-efecto de "confeti digital" (reutilizando el `ConfettiBlast` o CSS puro) que se dispare al presionar el botón de reclamo.

## Open Questions

> [!IMPORTANT]
> - **Cantidades del Nivel 3 (VIP):** Hemos fijado el Nivel 3 en 500 tokens. Si la fracción vale ~$5, el VIP cuesta ~$2,500 USD. ¿Están bien estos valores para la demo o reducimos el VIP a 250 tokens para que el tester llegue más fácil?
> - **Etiquetas en la SongCard:** ¿El texto `🎁 Desbloquea...` debajo del artista debe aparecer en *todas* las tarjetas o sólo en las que tengan la bandera `isPremiumAsset` / `BLUE CHIP`?

## Plan de Verificación
1. Inyectar la metadata a nivel local.
2. Comprobar visualmente la portada del Marketplace: revisar si los badges `BLUE CHIP`, `HOT` y `PERKS DISPONIBLES` se alinean sin romper el diseño responsive.
3. Entrar a una canción con 0 tokens: verificar que los 3 pilares se muestran bloqueados.
4. Adquirir 51 tokens: verificar que el Nivel 1 se ilumina en cyan y muestra el botón de Reclamar.
