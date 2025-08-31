# 🎲 Rigged

Una herramienta simple, rápida y gratuita para sorteos en Twitch. Realiza sorteos en tiempo real del chat con múltiples ganadores, exporta resultados y mantén a tu audiencia involucrada.

## ✨ Características

- **Integración de chat en tiempo real** - Captura automáticamente mensajes del chat durante los períodos de sorteo
- **Múltiples ganadores** - Puedes sacar uno o más ganadores, tantos como participantes haya
- **Exportar resultados** - Guarda datos completos del sorteo y listas de ganadores (👷 en construcción)
- **Código Libre** - Siéntete libre de usarlo desde tu computadora o bien, alójalo en un servidor propio.

## 🎯 ¿Para quién es esto?

Streamers pequeños que necesitan una herramienta de sorteos confiable sin quebrar el cochinito. Si estas cansado de las cochinadas que hay en el mercado, estamos tratando de construir una herramienta sencilla que pueda cambiar eso y que puedas usar desde tu computadora.

## 🚀 Inicio Rápido

### Requisitos Previos

- **Node.js 18+** - [Descargar aquí](https://nodejs.org/)
- **Aplicación de Twitch** - Necesitarás crear una (te guiaremos en el proceso) (🏗️ estamos trabajando)

### Configuración en Windows

1. **Descarga y extrae** la última versión o clona este repositorio
2. **Abre el Símbolo del Sistema** en la carpeta del proyecto
3. **Instala las dependencias:**
   ```cmd
   bun install
   ```
4. **Crea tu aplicación de Twitch:**
   - Ve a [Consola de Desarrollador de Twitch](https://dev.twitch.tv/console)
   - Haz clic en "Register Your Application"
   - Nombre: `Sorteos de Tu Stream` (o como prefieras)
   - URL de Redirección OAuth: `https://localhost:3001/auth/callback`
   - Categoría: `Application Integration`
   - Copia tu **Client ID**

5. **Configura la aplicación:**
   - Copia `.env.example` a `.env`
   - Edita `.env` y agrega tu Client ID:
     ```
     VITE_CLIENT_ID=tu_client_id_aqui
     ```

6. **Inicia la aplicación:**
   ```cmd
   bun dev
   ```

7. **Abre tu navegador** y ve a `https://localhost:3001`

### Configuración en macOS

1. **Descarga y extrae** la última versión o clona este repositorio
2. **Abre Terminal** en la carpeta del proyecto
3. **Instala las dependencias:**
   ```bash
   bun install
   ```
4. **Crea tu aplicación de Twitch** (mismos pasos 4-5 que Windows)
5. **Inicia la aplicación:**
   ```bash
   bun dev
   ```
6. **Abre tu navegador** y ve a `https://localhost:3001`

### Configuración en Linux

1. **Clona o descarga** el repositorio
2. **Abre terminal** en la carpeta del proyecto
3. **Instala las dependencias:**
   ```bash
   bun install
   ```
4. **Crea tu aplicación de Twitch** (mismos pasos 4-5 que Windows)
5. **Inicia la aplicación:**
   ```bash
   bun dev
   ```
6. **Abre tu navegador** y ve a `https://localhost:3001`

## 🎮 Cómo Usar

### Configuración Inicial
1. **Conecta con Twitch** - Haz clic en el botón morado para autorizar la aplicación
2. **Otorga permisos** - La aplicación necesita leer tu chat e información básica del perfil
3. **¡Estás listo!** - Comienza a hacer sorteos inmediatamente

### Ejecutando un Sorteo
1. **Palabra Clave** - Primero agrega la palabra clave que quieres que el chat escriba
2. **Inicia captura** - Haz clic en "Iniciar Sorteo" cuando estés listo para comenzar
3. **Deja que los viewers participen** - Cualquiera que chatee y escriba la palabra clave durante este período se inscribe automáticamente
4. **Detén y sortea** - Haz clic en "¡Siguiente paso!" para dejar de capturar y alistarte para seleccionar al ganador
5. **Elegir un ganador** - Presiona "¡Elegir un ganador!" para seleccionar al primer ganador, el botón te permite elegir más ganadores
6. **Exporta si es necesario** - Guarda la lista completa de participantes y resultados (🛠️ ya merito)

### Consejos para el Éxito
- **Anuncia claramente** cuándo empiezan y terminan los sorteos
- **Establece reglas claras** sobre participación (un mensaje = una entrada, etc.)
- **Usa múltiples rondas** 👷 está planeado agregar "descartados" para agregar emoción al sorteo
- **Exporta resultados** para verificar imparcialidad si te lo cuestionan (👷 ya saben...)

## ⚙️ Configuración

### Variables de Entorno
Crea un archivo `.env` en el directorio raíz:

```env
VITE_CLIENT_ID=tu_client_id_de_twitch
```

### Permisos de Twitch
La aplicación solicita estos permisos:
- `user:read:chat` - Para leer mensajes del chat para sorteos
- `user:bot` - Para conectarse como usuario bot
- `channel:bot` - Para acceder a funciones de bot del canal
- `user:read:email` - Para información básica del perfil

## 🛠️ Desarrollo

Este proyecto usa:
- **React 19** con TypeScript
- **TanStack Router** para navegación
- **TanStack Store** para manejo de estado
- **Tailwind CSS** para estilos
- **Vite** para desarrollo y construcción

```bash
# Instalar dependencias
bun install

# Iniciar servidor de desarrollo
bun dev

# Construir para producción
bun build

# Previsualizar construcción de producción
bun preview
```

## 🔒 Privacidad y Seguridad

- **Solo local** - Todos los datos permanecen en tu computadora
- **Sin rastreo** - No recopilamos ningún análisis o datos personales
- **Permisos mínimos** - Solo solicita lo necesario para la funcionalidad principal
- **Código abierto** - Puedes verificar exactamente qué hace el código para que vean que no gana puro primo

## 📋 Requisitos del Sistema

- **Windows 10+**, **macOS 10.15+**, o **Linux** (cualquier distribución moderna)
- **Node.js 18 o superior**
- **Navegador web moderno** (Chrome, Firefox, Safari, Edge)
- **Conexión a internet** para integración con Twitch

## ❓ Solución de Problemas

### "No se puede conectar a Twitch"
- Verifica tu conexión a internet
- Verifica que tu Client ID sea correcto en el archivo `.env`
- Asegúrate de que la URL de redirección en tu aplicación de Twitch coincida exactamente: `https://localhost:3001/auth/callback`

### Errores de "Permiso denegado"
- Asegúrate de haber otorgado todos los permisos solicitados durante el login
- Intenta cerrar sesión e iniciar sesión nuevamente

### La aplicación no inicia
- Asegúrate de que Node.js 18+ esté instalado: `node --version`
- Elimina `node_modules` y ejecuta `bun install` nuevamente
- Verifica que el puerto 3001 no esté siendo usado por otra aplicación

### ¿Sigues teniendo problemas?
Revisa la consola del navegador (F12) para mensajes de error. La mayoría de los problemas están relacionados con configuración incorrecta de la aplicación de Twitch.

## 💻 Configuración Local para Uso Personal

> 🚧 **En Construcción** - ¡Instrucciones detalladas de configuración personal próximamente!

Esta sección incluirá:
- Tutorial paso a paso de la Consola de Desarrollador de Twitch con capturas de pantalla
- Ejemplos detallados de configuración del archivo `.env`
- Problemas comunes de configuración y sus soluciones
- Cómo mantener tu instancia local actualizada
- Procedimientos de respaldo y restauración para tus datos de sorteos
- Consejos para ejecutar Rigged junto con tu software de streaming

La configuración básica arriba te permite comenzar, pero esta sección hará el proceso aún más fácil para usuarios no técnicos.

## 📄 Licencia

Licencia MIT - Siéntete libre de usar, modificar y distribuir según sea necesario.

---

**Hecho con ❤️ por Ozmah**