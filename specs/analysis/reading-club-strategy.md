# Estrategia: Reading Pal para Clubes de Lectura

**Fecha**: 2026-06-13

---

## Contexto

La app está en un estado sólido como tracker personal, pero ese espacio está saturado
(Goodreads, StoryGraph). Para diferenciarse, el enfoque es clubs de lectura casuales —
grupos de ocio y esparcimiento para personas que están empezando a conocer la obra literaria,
no grupos académicos.

---

## Insight clave

Un club de lectura casual tiene dinámicas muy específicas que ninguna app atiende bien:

- La gente no quiere sentirse evaluada — quieren divertirse
- Hay miembros que leyeron todo, los que leyeron la mitad, y los que no leyeron nada (y nadie lo admite)
- La reunión es el evento social, el libro es el pretexto
- Los nuevos lectores necesitan andamiaje: no saben qué preguntar, qué buscar, cómo opinar

---

## Ideas diferenciadores

### 1. Clubs compartidos
Crear o unirse a un club. Un libro del mes compartido. Ver el progreso de cada miembro
(sin presión — solo un avatar con % de avance). Votación para el próximo libro.

### 2. Preguntas de discusión generadas por IA (Gemini)
"Genera 5 preguntas de discusión para los capítulos 1–10 de este libro, para un grupo casual."
El facilitador las tiene listas antes de la reunión. Diferenciador fuerte para grupos sin
moderador experto.

### 3. Modo Spoilers / progreso seguro
Las quotes y comentarios se marcan con hasta qué capítulo/página llegaste. Nadie ve
contenido de donde no ha llegado todavía.

### 4. Reacciones a quotes
Los miembros del club pueden reaccionar a las citas que otros guardan (🔥😂😢🤯).
Social sin ser red social.

### 5. Celebraciones de hitos
Animación cuando alguien termina el libro del mes. Notificación al club
"¡[nombre] terminó el libro!". Gamificación suave y positiva.

### 6. "Ponte al día" (IA)
Botón para el que no leyó: resumen de los capítulos que debía haber leído esta semana,
generado por Gemini. Sin vergüenza, con discreción.

---

## Priorización

| Impacto | Esfuerzo | Feature |
|---------|----------|---------|
| 🔴 Alto | Medio | Clubs + libro del mes compartido |
| 🔴 Alto | Bajo | Preguntas de discusión IA |
| 🟡 Medio | Bajo | Hitos con celebración |
| 🟡 Medio | Alto | Progreso compartido sin spoilers |
| 🟢 Bajo | Medio | Reacciones a quotes |

---

## Próximos pasos sugeridos

1. **Preguntas de discusión por IA** — rápido de implementar, muy concreto para el caso
   de uso. Usa la infraestructura de Gemini ya existente.
2. **Clubs compartidos** — feature estructural que cambia el modelo de la app de personal
   a social. Requiere modelo de datos nuevo (clubs, membresías, libro del mes).
