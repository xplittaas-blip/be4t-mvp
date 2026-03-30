---
aliases: [Conversion Playbook, Redesign, UX Detail]
tags: [xplit, product, ux, ui, conversion]
---

# 💰 Conversion Redesign Playbook

La vista de `.song-detail-page` se transformó de un perfil puramente narrativo/informativo a un **embudo de conversión** con fricción nula. 

El modelo a seguir es mezclar la interfaz estética inmersiva de plataformas auditivas orientadas a la GenZ, con la credibilidad matemática de plataformas D2C para Startups. 

## 📏 Sistema de CSS Grid (Desktop 2-Column Layout)

Para mantener la calculadora visible en el primer momento crítico en el que el usuario considera unirse al fondo de regalías, construimos un Layout de Grid pegajoso.

- **Columna Izquierda (Narrativa)**: Ocupa el `1.5fr`. Alberga el *Hero*, las *Píldoras de Tracción*, The *Momentum Signal* y la sección *Why this song matters*. El objetivo psicólogico es la Validación y prueba social mediática.
- **Columna Derecha (Transaccional)**: Ocupa `1fr`. Encapsula `.calculator-section` con un `position: sticky; top: 100px;`. El panel hace *scroll lock* mientras el usuario explora a la izquierda. 

## 💥 Gatillos de Conversión Integrados

### FOMO y Prueba Social (Social Proof)
Dentro de la calculadora de participación añadimos el mensaje: `1,248 fans ya están participando.`
La prueba numérica mitiga fuertemente la duda inicial, confirmando que otros usuarios han validado que la acción es de bajo riesgo y de capital cultural atractivo.

### Micro-Fricción y Píldoras Pre-empaquetadas
Se eliminaron los inputs técnicos a favor de selectores de **Píldoras Nominales ($10, $25, $50, $100)**. El usuario pre-visualiza su *"Retorno y regalía estimada"* instantáneamente al interactuar.

### Estimaciones de 'Break-Even'
Junto al modal transaccional de `<AuthModal />` y `<SuccessModal />`, las estimaciones explicitan que el periodo de riesgo se salda entre los *8 a 12 meses* usando datos en vivo provistos por [[Marketplace Momentum Score]].

---
👉 **Aviso de Stacking Context:**
Las alertas de finalización deben escapar el _Stacking Context_ inyectado por el Layout animado usando la utilidad `createPortal(..., document.body)`.

🔗 **Ver También:** 
- [[Tone and Voice]] para mantener coherente el etiquetado.
- [[Global Audio Player Context]] para lograr retener a la audiencia mientras calculan aportes.
