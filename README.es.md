# 🎲 Rigged

Una herramienta simple, rápida y gratuita para sorteos en Twitch. Realiza sorteos en tiempo real del chat con múltiples ganadores, exporta resultados y mantén a tu audiencia involucrada.

## ✨ Características

- **Integración de chat en tiempo real** - Captura automáticamente mensajes del chat durante los períodos de sorteo
- **Múltiples ganadores** - Selecciona uno o más ganadores de los participantes
- **Filtrado avanzado** - Excluye moderadores, suscriptores o VIPs de los sorteos
- **Boletos extra** - Otorga entradas adicionales a suscriptores y VIPs para mejores probabilidades
- **Cambio de canales** - Los moderadores pueden realizar sorteos en canales que moderan
- **Persistencia de estado** - Tus configuraciones y preferencias se guardan entre sesiones
- **Visualización de mensajes** - Ve mensajes entrantes en tiempo real durante los sorteos
- **Código abierto** - Solución auto-hospedada con total transparencia

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
    - URL de Redirección OAuth: `https://localhost:3001/callback`
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
1. **Establecer palabra clave** - Ingresa la palabra o frase que los participantes deben escribir
2. **Configurar opciones** - Usa configuraciones avanzadas para excluir ciertos tipos de usuarios o dar boletos extra
3. **Iniciar sorteo** - Haz clic en "Iniciar Sorteo" para comenzar a capturar mensajes del chat
4. **Monitorear participación** - Observa mensajes en tiempo real y el conteo de participantes
5. **Preparar ganadores** - Haz clic en "Preparar Sorteo" para detener la captura y preparar la selección de ganadores
6. **Seleccionar ganadores** - Haz clic en "Ejecutar Sorteo" para seleccionar y anunciar ganadores aleatoriamente
7. **Reiniciar para siguiente ronda** - Limpia participantes o ajusta configuraciones para otro sorteo

### Consejos para el Éxito
- **Anuncia claramente** cuándo empiezan y terminan los sorteos
- **Establece reglas claras** sobre participación y elegibilidad
- **Usa opciones avanzadas** para personalizar sorteos según tu comunidad
- **Prueba configuraciones** con el generador de mensajes integrado antes de ir en vivo
- **Cambia de canales** si moderas múltiples streams y quieres realizar sorteos allí

## ⚙️ Configuración

### Variables de Entorno
Crea un archivo `.env` en el directorio raíz:

```env
VITE_CLIENT_ID=tu_client_id_de_twitch
VITE_ANON_DEBUG=1
```

- `VITE_CLIENT_ID` - Tu ID de cliente de la aplicación de Twitch
- `VITE_ANON_DEBUG` - Establece en `1` para anonimizar datos sensibles en herramientas de debug (recomendado)

### Permisos de Twitch
La aplicación solicita estos permisos:
- `user:read:chat` - Leer mensajes del chat durante períodos de sorteo
- `user:bot` - Conectarse al chat como usuario bot
- `channel:bot` - Acceder a funciones de bot específicas del canal
- `channel:moderate` - Acceder a funciones de moderación para canales que moderas
- `user:read:email` - Información básica del perfil para autenticación

## 🛠️ Desarrollo

Este proyecto usa:
- **React 19** con TypeScript
- **TanStack Router** para navegación y enrutamiento
- **TanStack Store** para manejo de estado
- **TanStack DevTools** para depuración y desarrollo
- **Tailwind CSS** para estilos
- **Phosphor Icons** para iconografía
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
- Asegúrate de que la URL de redirección en tu aplicación de Twitch coincida exactamente: `https://localhost:3001/callback`

### Errores de "Permiso denegado"
- Asegúrate de haber otorgado todos los permisos solicitados durante el login
- Intenta cerrar sesión e iniciar sesión nuevamente
- Verifica que tengas privilegios de moderación si intentas cambiar de canales

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