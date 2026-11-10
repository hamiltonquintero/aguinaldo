# 🎄 Aguinaldo Navideño Familiar - Amigo Secreto 🎁

Un sistema web navideño mágico, festivo y elegante creado especialmente para organizar el juego de **Aguinaldo / Amigo Secreto** en familia, con animaciones interactivas, efectos de sonido festivos, nieve en pantalla y tres modalidades secretas para revelar y entregar los resultados sin arruinar la sorpresa.

---

## ✨ Características Principales

### 🎅 1. Estética y Ambiente Navideño
- **Nieve animada interactiva:** Copos de nieve flotando suavemente sobre el lienzo (se puede pausar o reanudar).
- **Guirnalda de luces navideñas:** Focos titilantes multicolores en la parte superior.
- **Efectos de sonido festivos (Web Audio API):** Cascabeles, chimes mágicos, fanfarrias y sonido de papel de regalo abriéndose (sin archivos pesados, se puede activar o silenciar con un botón).
- **Diseño cálido y elegante:** Paleta de verde pino esmeralda, rojo fiesta y dorado brillante, con tipografías festivas.

### 👥 2. Gestión de Participantes & Reglas
- **Carga rápida de lista:** Puedes copiar y pegar la lista de nombres directamente desde WhatsApp o notas (un nombre por línea o separados por comas).
- **Tarjetas personalizadas:** Cada participante puede tener:
  - Nombre completo
  - WhatsApp / Teléfono (opcional para envío directo)
  - Lista de deseos / gustos / sugerencias (tallas, dulces favoritos, hobbies)
  - **Restricciones / Exclusiones:** Selección rápida de personas a las que **no** debe regalarle (ej: esposos, hermanos o papás e hijos si no quieren regalarse entre ellos).
- **Configuración del Evento:** Personaliza el título de la fiesta, fecha, hora, lugar de reunión, presupuesto sugerido y reglas especiales.

### 🎲 3. Sorteo Mágico (Algoritmo Matemático de Desarreglo)
- Garantiza que **nadie se saque a sí mismo** ($P(i) \neq i$).
- Respeta estrictamente todas las exclusiones configuradas sin caer en puntos muertos gracias al algoritmo de backtracking aleatorizado.
- Animación festiva de mezcla con explosión de confeti navideño y campanitas.

### 🤫 4. Tres Modos de Entrega Confidencial (¡Sin Spoilers!)
1. **Modo "Pasa el Celular" (En Vivo / Nochebuena):**
   - Ideal si la familia está reunida frente a la pantalla o árbol de Navidad.
   - Cada persona selecciona su nombre, hace clic en *"Soy [Nombre], ver mi amigo"* y se abre una **caja de regalo 3D animada**.
   - Al tocar el regalo, se desata la cinta dorada con confeti y revela a su amigo secreto con su lista de deseos.
   - Incluye botón *"¡Listo, ocultar!"* y un contador que marca quién ya vio su resultado.
2. **Modo "WhatsApp Secreto" (Enlaces Mágicos Cifrados):**
   - Genera para cada persona un mensaje con un enlace cifrado único (`#reveal=...`).
   - El organizador puede enviarlo directamente por WhatsApp **sin enterarse** de a quién le tocó regalarle a nadie.
   - Al abrir el enlace, solo esa persona ve la caja de regalo abriéndose.
3. **Modo "Tarjetas Navideñas Imprimibles":**
   - Vista optimizada para imprimir (`Ctrl + P`).
   - Cada tarjeta tiene una línea punteada para doblarla por la mitad y colgarla en el árbol de Navidad.

### 🏆 5. Bonus: Juegos Tradicionales de Aguinaldos
- Guía interactiva con las reglas de los juegos clásicos de novenas:
  - *Dar y no recibir*
  - *Pajita en boca*
  - *Al sí y al no*
  - *Beso robado*
  - *Estatua*
- Marcador de puntos en tiempo real para coronar al campeón familiar de los aguinaldos.

---

## 🚀 Cómo Ejecutar el Proyecto

### Opción A: Modo Desarrollo (Servidor local)
```bash
npm run dev
```
Abre en tu navegador la URL que indique la consola (generalmente `http://localhost:5173`).

### Opción B: Construir para Producción o Desplegar
```bash
npm run build
```
Genera la carpeta `dist/` optimizada y lista para subir a cualquier hosting gratuito (como Vercel, Netlify o GitHub Pages) o abrir localmente.

---

## 💡 Próximo Paso
El diseño y toda la base interactiva ya están completamente listos y funcionando con una familia de ejemplo cargada para pruebas. Cuando tengas tu lista de participantes, solo compártela y la agregamos de inmediato.

