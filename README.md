# AI-TaskMind

Un gestor de tareas inteligente que utiliza Inteligencia Artificial para desglosar actividades macro en subtareas técnicas ejecutables.

## 🚀 Características
- **Desglose Inteligente:** Utiliza modelos de lenguaje (Gemini o Ollama) para generar subtareas estructuradas.
- **Configurable:** Soporta múltiples proveedores de IA a través de variables de entorno.
- **Resiliente:** Implementación de reintentos automáticos ante saturación de API.
- **Seguro:** Gestión de variables de entorno protegida.

## 🛠 Tecnologías Utilizadas
- **Backend:** Node.js, Express, TypeScript, React.
- **IA:** Google Generative AI (Gemini) y Ollama.
- **Base de Datos:** MongoDB (vía Mongoose).

💡 Arquitectura y Flujo de Datos
El proyecto implementa una arquitectura cliente-servidor donde el frontend consume un servicio de IA abstracto en el backend:

Frontend (Vite + React): Captura los datos del usuario y envía una petición POST al endpoint /api/tasks/generate.

Backend (Node.js + Express):

Recibe la petición y selecciona el motor de IA (Ollama o Gemini) basándose en la variable de entorno AI_PROVIDER.

Resiliencia: Implementa una lógica de reintento ante errores de saturación (429) de la API de Gemini.

Limpieza: Procesa la respuesta de la IA (eliminando bloques de código Markdown) para retornar un JSON limpio al frontend.

Persistencia: Las subtareas generadas pueden ser almacenadas en MongoDB para su gestión posterior.

🖥️ Frontend (AI-TaskMind-Client)
La interfaz de usuario ha sido diseñada para una experiencia fluida:

Formulario Dinámico: Interfaz intuitiva para ingresar el título y descripción de la tarea macro.

Feedback Visual: Indicadores de estado mientras el backend procesa la solicitud a la IA.

Configuración: Utiliza variables de entorno (VITE_API_URL) para conectar con la API local o en producción.

🛠️ Despliegue (Deploy)
El proyecto está preparado para ser desplegado en servicios como Render o Railway:

Backend: Requiere las variables AI_PROVIDER y GEMINI_API_KEY configuradas en el dashboard del proveedor.

Frontend: Se compila como archivos estáticos y es servido directamente o a través de un CDN, apuntando a la URL del backend desplegado.

## ⚙️ Instalación y Configuración Servidor

1. Clona el repositorio:
   ```bash
   git clone [https://github.com/matalala/ai-taskmind.git](https://github.com/matalala/ai-taskmind.git)

2. Instala las dependencias:

```Bash 
npm install

3. Crea un archivo .env en la raíz basado en el ejemplo:

Fragmento de código
AI_PROVIDER=gemini
GEMINI_API_KEY=tu_api_key_aqui
MONGODB_URI=tu_string_de_conexion

4. Inicia el servidor:

   ```Bash
npm run dev

## 🖥️ Frontend (AI-TaskMind-Client)

La interfaz permite a los usuarios ingresar el título y descripción de su tarea, conectándose al backend para recibir las subtareas generadas por IA.

### Configuración del Frontend
1. Entra a la carpeta del frontend:
   ```bash
   cd client

2. Instala las dependencias:

   ```Bash
npm install

3. Crea tu archivo .env en la carpeta client:

Fragmento de código
VITE_API_URL=http://localhost:5000

4. Ejecuta el cliente:

   ```Bash
npm run dev

🚀 Ejecución Completa (Local)

Para que la aplicación funcione, debes tener ambos servicios corriendo simultáneamente:

Terminal 1 (Backend):

   ```Bash
npm run dev
Deberías ver en consola: "[AI System] Conectando con el motor: OLLAMA"

Terminal 2 (Frontend):

   ```Bash
cd client
npm run dev
🧠 Flujo de Selección de IA
El sistema detecta automáticamente si estás en desarrollo local (usando Ollama) o en producción (usando Gemini) mediante el selector de proveedores.

📝 Notas de Desarrollo
El proyecto utiliza TypeScript con configuraciones estrictas para asegurar la estabilidad del código.

Se implementó una lógica de retry (reintento) para manejar errores de saturación (HTTP 429) de la API de Google.

Desarrollado por Victor Cavallo


### Un par de consejos para que luzca mejor:

1.  **Imágenes/Capturas:** Si tienes capturas de pantalla de cómo se ve la interfaz o el JSON que devuelve la IA, súbelas a una carpeta `/images` y agrégalas al `README` con `![Descripción](images/captura.png)`. ¡Eso impresiona mucho a los reclutadores!
2.  **Sección de "Cómo contribuir":** Si quieres que otros colaboren, añade una sección breve explicando cómo pueden hacer un `Pull Request`.
3.  **badges (Escudos):** Puedes buscar en [Shields.io](https://shields.io/) para agregar escuditos de "Built with TypeScript", "Node.js", "MongoDB", etc. Quedan muy profesionales al principio del archivo.

¿Te gustaría agregar algo específico sobre cómo funciona el despliegue o lo dejamos así para