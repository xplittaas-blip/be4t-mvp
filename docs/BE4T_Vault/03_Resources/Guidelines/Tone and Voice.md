---
aliases: [Tone and Voice, Music First rule, Language rules]
tags: [xplit, guidelines, narrative, product]
---

# 🎙️ Tone & Voice Guidelines

El principio más grande y fundamental de **Xplit** es que somos una plataforma **Music-First**, no una entidad financiera corporativa. El enfoque principal debe ser la conexión entre el **fan** y la trayectoria de la **canción** o del **artista**.

Al redactar *copys*, alertas o interfaces de usuario, todas las traducciones (EN, ES, PT) deben seguir el lineamiento sagrado de eliminar la jerga financiera.

## 🚫 Términos Prohibidos vs. ✅ Términos Recomendados

| 🚫 Nunca uses (Finanzas) | ✅ Usa en su lugar (Música) | Razón Biopsicológica |
| ------------------------ | --------------------------- | -------------------- |
| "Token" o "Security"     | "Share", "Participación"    | Evoca a una cooperativa de fans, no a Wall Street. |
| "Yield" o "Dividends"    | "Royalties", "Regalías"     | Se alínea estructuralmente con el canon y vocabulario nativo de la industria musical. |
| "Trading" o "Trade"      | "Exchange", "Intercambio"   | Evita connotaciones de criptobros o "day traders" especulativos. |
| "Investment Return"      | "Royalty Potential"         | Dirige la atención al rendimiento intrínseco de la música (streams) en vez de un activo aislado. |

## 🇪🇸 Traducción Estricta (`react-i18next`)

Se implementó el hub centralizado en JSON. Si deseas actualizar vocabulario, usa siempre claves como `t('join_button')`.
Ejemplos en los namespace locales:
- `Obtener mi parte` (Boton interactivo y con llamado a la acción claro).
- `Descubre tu próxima canción favorita` (En lugar de "Explora activos disponibles").

### 👉 Conexiones Internas
- Aplica directamente al documento de conversión: [[Conversion Redesign Playbook]]
- Influye en el rediseño de UI: [[Marketplace Momentum Score]]
