# Asistente IA para WhatsApp™ Web

Extensión ligera y rápida para **WhatsApp™ Web** que genera sugerencias de respuesta según el contexto del chat, permite elegir el tono al instante y mejora o traduce tus borradores usando proveedores de IA **100% gratuitos** (**Groq Cloud** y **Google Gemini**).

## Características principales

- **Respuestas contextuales en 1 clic (`Generar IA`):** Lee los últimos mensajes de la conversación y redacta una respuesta adaptada a tu propio estilo de escritura.
- **Selector rápido de tono/intención en la barra:**
  - `Mi estilo` (usa tu estilo base configurado en Ajustes)
  - `Formal` / `Casual` / `Corto`
  - `Decir Sí` / `Decir No`
  - `Personalizado...` (escribe qué quieres responder y la IA lo redacta por ti)
- **Mejora y traducción de borradores (`Aplicar`):**
  - `Mejorar texto` (corrige ortografía y fluidez de lo que escribiste en la barra de WhatsApp)
  - `A Inglés` / `A Español`
  - `Más formal` / `Más corto`
- **100% Gratis (Sin tarjeta de crédito):**
  - Soporta **Groq Cloud** (`console.groq.com/keys`) y **Google Gemini** (`aistudio.google.com/apikey`).
  - Autodetección en vivo de los modelos activos en tu cuenta.
- **Privacidad y seguridad:** Tu API Key se guarda únicamente en el almacenamiento local de tu propio navegador (`chrome.storage.local`).

---

## Instalación (Chrome, Opera, Edge, Brave)

1. Ve a la sección **[Releases](../../releases)** de este repositorio y descarga el archivo **`Asistente-IA-WhatsApp-Pro.zip`** (o clona este repositorio con `git clone`).
2. Descomprime el archivo `.zip` en una carpeta de tu computadora.
3. **Instalación guiada en Windows (Recomendado):** Haz doble clic en **`Instalar-Asistente-IA.bat`** dentro de la carpeta extraída. El asistente copiará los archivos a una ruta fija (`%LOCALAPPDATA%\Asistente-IA-WhatsApp-Pro`), copiará esa ruta al portapapeles y abrirá la página de extensiones de tu navegador.
4. En la página de extensiones (`chrome://extensions`, `edge://extensions`, `brave://extensions` u `opera://extensions`):
   - Activa el **Modo de desarrollador** (arriba a la derecha).
   - Haz clic en **Cargar descomprimida** (*Load unpacked*), pega la ruta con `Ctrl + V` (si usaste el `.bat`) y selecciona la carpeta.
5. Al instalarse, se abrirá la pantalla de bienvenida para elegir si deseas activar **ambas funciones** (Transcripción de Audios + Asistente de Texto) o **solo una**, y configurar tu API Key gratuita de **Groq** o **Google Gemini**.

## Publicación automática

El workflow `.github/workflows/build-release.yml` se ejecuta automáticamente cada vez que se hace `push` a `main` o `master`. El proceso valida los archivos JavaScript, toma la versión de `manifest.json`, genera los archivos ZIP y publica o actualiza una Release de GitHub con ellos.

Para publicar una nueva versión:

1. Actualiza el campo `version` en `manifest.json`.
2. Haz commit y push a `main`.
3. Descarga `Asistente-IA-WhatsApp-Pro.zip` desde la sección **[Releases](../../releases)**.

También se puede ejecutar manualmente desde **GitHub → Actions → Empaquetar y Publicar Extensión (.zip) → Run workflow**.
