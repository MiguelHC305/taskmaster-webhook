// Ejemplos de código para usar con el sistema TaskMaster desde el frontend

const API_BASE = 'https://ea8cdad8-c834-41b0-ad3b-9eaffe2723da-00-3dah32om4uqje.picard.replit.dev';

// 1. CREAR UN NUEVO WEBHOOK
async function handleAddWebhook() {
  try {
    const response = await fetch(`${API_BASE}/api/webhooks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Mi Sistema de Gestión',
        endpoint: '/webhook/mi-sistema',
        description: 'Webhook para recibir actualizaciones de tareas',
        isActive: true,
        secretToken: 'mi-token-secreto-123'
      }),
    });

    if (response.ok) {
      const webhook = await response.json();
      console.log('Webhook creado:', webhook);
      // Guardar el webhook.id para usarlo después
      return webhook;
    } else {
      const error = await response.json();
      console.error('Error al crear webhook:', error);
      throw new Error(error.error);
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// 2. ENVIAR UNA TAREA AL WEBHOOK
async function sendTaskToWebhook(webhookId, taskData) {
  try {
    const response = await fetch(`${API_BASE}/api/webhook/${webhookId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Secret-Token': 'mi-token-secreto-123' // Debe coincidir con el token del webhook
      },
      body: JSON.stringify({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status, // 'pending', 'in-progress', 'completed', 'cancelled'
        priority: taskData.priority || 'medium', // 'low', 'medium', 'high', 'urgent'
        projectName: taskData.projectName,
        assignee: taskData.assignee,
        sourceSystem: taskData.sourceSystem || 'web-app',
        externalId: taskData.externalId,
        metadata: taskData.metadata
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Tarea procesada:', result);
      return result;
    } else {
      const error = await response.json();
      console.error('Error al enviar tarea:', error);
      throw new Error(error.error);
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// 3. OBTENER LISTA DE WEBHOOKS
async function getWebhooks() {
  try {
    const response = await fetch(`${API_BASE}/api/webhooks`);
    
    if (response.ok) {
      const webhooks = await response.json();
      console.log('Webhooks:', webhooks);
      return webhooks;
    } else {
      throw new Error('Error al obtener webhooks');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// 4. OBTENER TODAS LAS TAREAS
async function getTasks() {
  try {
    const response = await fetch(`${API_BASE}/api/tasks`);
    
    if (response.ok) {
      const tasks = await response.json();
      console.log('Tareas:', tasks);
      return tasks;
    } else {
      throw new Error('Error al obtener tareas');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// 5. OBTENER ESTADÍSTICAS DEL DASHBOARD
async function getDashboardStats() {
  try {
    const response = await fetch(`${API_BASE}/api/dashboard/stats`);
    
    if (response.ok) {
      const stats = await response.json();
      console.log('Estadísticas:', stats);
      return stats;
    } else {
      throw new Error('Error al obtener estadísticas');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// 6. EJEMPLO DE USO COMPLETO
async function ejemploCompletoDeUso() {
  try {
    // Crear webhook
    const webhook = await handleAddWebhook();
    console.log('Webhook creado con ID:', webhook.id);
    
    // Enviar una tarea completada (esto enviará email automáticamente)
    await sendTaskToWebhook(webhook.id, {
      title: 'Nueva funcionalidad implementada',
      description: 'Sistema de autenticación completado exitosamente',
      status: 'completed', // Esto enviará una notificación por email
      priority: 'high',
      projectName: 'Mi Aplicación',
      assignee: 'desarrollador@empresa.com',
      sourceSystem: 'mi-sistema',
      externalId: 'TASK-123',
      metadata: {
        category: 'Backend',
        estimatedHours: 8,
        actualHours: 6,
        completedBy: 'Juan Pérez'
      }
    });
    
    // Obtener estadísticas actualizadas
    const stats = await getDashboardStats();
    console.log('Estadísticas actualizadas:', stats);
    
    // Obtener todas las tareas
    const tasks = await getTasks();
    console.log('Total de tareas:', tasks.length);
    
  } catch (error) {
    console.error('Error en el ejemplo:', error);
  }
}

// 7. FUNCIÓN PARA USO CON REACT/FRONTEND
function useWebhookAPI() {
  return {
    createWebhook: handleAddWebhook,
    sendTask: sendTaskToWebhook,
    getWebhooks,
    getTasks,
    getStats: getDashboardStats
  };
}

// EXPORTAR PARA USO EN MÓDULOS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleAddWebhook,
    sendTaskToWebhook,
    getWebhooks,
    getTasks,
    getDashboardStats,
    ejemploCompletoDeUso,
    useWebhookAPI
  };
}