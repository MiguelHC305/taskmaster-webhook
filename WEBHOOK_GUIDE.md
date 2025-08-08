# Guía de Uso del Sistema de Webhooks TaskMaster

## Configuración de Gmail completada ✅

El sistema ya está configurado con tus credenciales de Gmail:
- **Email**: mhc638417@gmail.com
- **SMTP**: Gmail configurado correctamente
- **Notificaciones**: Las notificaciones de tareas completadas se envían automáticamente

## Cómo usar el sistema

### 1. Crear un Webhook

```bash
curl -X POST http://localhost:5000/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Sistema de Gestión",
    "endpoint": "/webhook/mi-sistema",
    "description": "Webhook para recibir actualizaciones de tareas",
    "isActive": true,
    "secretToken": "mi-token-secreto-123"
  }'
```

**Respuesta:**
```json
{
  "name": "Mi Sistema de Gestión",
  "endpoint": "/webhook/mi-sistema",
  "isActive": true,
  "id": "webhook-id-generado",
  "createdAt": "2025-08-08T18:59:00.000Z"
}
```

### 2. Enviar actualizaciones de tareas

Usa el ID del webhook para enviar tareas:

```bash
curl -X POST "http://localhost:5000/api/webhook/webhook-id-generado" \
  -H "Content-Type: application/json" \
  -H "X-Secret-Token: mi-token-secreto-123" \
  -d '{
    "title": "Nueva funcionalidad implementada",
    "description": "Sistema de autenticación completado",
    "status": "completed",
    "priority": "high",
    "projectName": "Mi Proyecto",
    "assignee": "desarrollador@empresa.com",
    "sourceSystem": "jira",
    "externalId": "PROJ-123",
    "metadata": {
      "category": "Backend",
      "estimatedHours": 8,
      "actualHours": 6,
      "completedBy": "Juan Pérez"
    }
  }'
```

## Estados de tareas disponibles

- `pending` - Pendiente
- `in-progress` - En progreso  
- `completed` - Completada (🔔 **Envía notificación por email**)
- `cancelled` - Cancelada

## Prioridades disponibles

- `low` - Baja
- `medium` - Media
- `high` - Alta
- `urgent` - Urgente

## Campos requeridos

- `title` - Título de la tarea
- `status` - Estado de la tarea
- `projectName` - Nombre del proyecto

## Campos opcionales

- `description` - Descripción detallada
- `priority` - Prioridad (por defecto: medium)
- `assignee` - Persona asignada
- `sourceSystem` - Sistema origen (jira, trello, etc.)
- `externalId` - ID en el sistema externo
- `metadata` - Datos adicionales en formato JSON

## Dashboard Web

Accede al dashboard en: http://localhost:5000

### Funcionalidades del dashboard:

1. **Dashboard principal** - Estadísticas y resumen
2. **Gestión de Tareas** - Ver todas las tareas recibidas
3. **Configuración de Webhooks** - Crear y gestionar webhooks
4. **Notificaciones** - Historial de emails enviados
5. **Logs del sistema** - Registro de actividad
6. **Monitoreo de salud** - Estado de los servicios

## Notificaciones automáticas por email

Cuando una tarea cambia a estado `completed`, el sistema:

1. ✅ Detecta el cambio automáticamente
2. ✅ Envía un email desde "TaskMaster" <mhc638417@gmail.com>
3. ✅ Incluye detalles de la tarea completada
4. ✅ Registra la notificación en el dashboard

## Ejemplo de uso real

```bash
# 1. Crear webhook para tu sistema
WEBHOOK_RESPONSE=$(curl -s -X POST http://localhost:5000/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sistema Producción",
    "endpoint": "/webhook/produccion", 
    "isActive": true,
    "secretToken": "prod-secret-2024"
  }')

# 2. Extraer el ID del webhook
WEBHOOK_ID=$(echo $WEBHOOK_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

# 3. Enviar tarea completada
curl -X POST "http://localhost:5000/api/webhook/$WEBHOOK_ID" \
  -H "Content-Type: application/json" \
  -H "X-Secret-Token: prod-secret-2024" \
  -d '{
    "title": "Deploy a producción completado",
    "description": "Versión 2.1.0 desplegada exitosamente",
    "status": "completed",
    "priority": "high",
    "projectName": "Aplicación Principal",
    "assignee": "admin@miempresa.com",
    "sourceSystem": "jenkins",
    "externalId": "BUILD-456"
  }'
```

El sistema procesará la tarea y enviará automáticamente un email de notificación.

## API Endpoints disponibles

- `POST /api/webhooks` - Crear webhook
- `GET /api/webhooks` - Listar webhooks
- `POST /api/webhook/{webhookId}` - Recibir tarea
- `GET /api/tasks` - Ver todas las tareas
- `GET /api/health` - Estado del sistema
- `GET /api/notifications` - Historial de emails