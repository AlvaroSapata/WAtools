# WAtools - Wind Advance

Una aplicación web progresiva (PWA) para gestionar modelos de trabajo repetibles y herramientas requeridas para el mantenimiento de turbinas eólicas.

## Características Principales

- **Gestión de Trabajos**: CRUD completo para modelos de trabajo con números de serie únicos
- **Gestión de Herramientas**: Inventario de herramientas simples y complejas con especificaciones
- **Subida de PDFs**: Almacenamiento de procedimientos en Firebase Storage
- **Búsqueda Avanzada**: Búsqueda prioritaria por título y filtrado por número de serie
- **Exportación**: PDF de resúmenes de trabajo y CSV de datos
- **Offline-First**: Funciona sin conexión con sincronización automática
- **PWA**: Instalable en dispositivos móviles y de escritorio

## Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Estado**: Zustand
- **Base de Datos**: Firebase Firestore
- **Almacenamiento**: Firebase Storage
- **Cache Local**: IndexedDB con Dexie
- **Exportación**: pdfmake (PDF) + papaparse (CSV)
- **Iconos**: Lucide React

## Configuración de Firebase

Para usar la aplicación completa, configura Firebase:

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilita Firestore Database
3. Habilita Storage
4. Actualiza `src/config/firebase.ts` con tu configuración
5. Configura las reglas de Firestore (ver reglas de ejemplo en el código)

## Estructura de Datos

### Trabajos (jobs)
- `title` (string, requerido)
- `serialNumber` (string, requerido, único)
- `description` (string, opcional)
- `procedurePdfUrl` (string, opcional)
- `createdAt` (timestamp)

### Herramientas (tools)
- `name` (string, requerido)
- `isRobust` (boolean, por defecto false)
- `complexDescription` (string, opcional, solo si es robusta)
- `notes` (string, opcional)
- `createdAt` (timestamp)

### Usos de Herramientas (job_tool_usages)
- `jobId` (referencia a trabajo)
- `toolId` (referencia a herramienta)
- `quantity` (número, por defecto 1)
- `notes` (string, opcional)
- `createdAt` (timestamp)

## Datos de Prueba

La aplicación incluye datos de prueba con:
- 3 herramientas de ejemplo (llave dinamométrica, bomba hidráulica, eslinga)
- 1 trabajo de ejemplo (cambio de pitch cylinder)
- Relaciones entre trabajos y herramientas

## Desarrollo

```bash
npm install
npm run dev
```

## Construcción

```bash
npm run build
```

La aplicación se construye como una PWA completa con service worker para funcionalidad offline.