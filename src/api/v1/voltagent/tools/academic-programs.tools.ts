import { createTool } from '@voltagent/core';
import { z } from 'zod';

export const getAcademicProgramsTools = () => {
  return [
    createTool({
      name: 'getMostRequestedKnowledgeAreas',
      description: 'Obtiene una lista de las áreas de conocimiento más solicitadas o populares en la universidad, únicamente las que esten habilitadas y sean relevantes para el usuario que esta consultando.',
      parameters: z.object({
        limit: z.number().optional().describe('Cantidad de áreas a retornar (por defecto 5)')
      }),
      execute: async ({ limit = 5 }) => {
        // TODO: Inyectar el AcademicProgramsService para hacer queries reales a PostgreSQL.
        // Por ahora, retornamos un mock estructurado para que el agente pueda responder.
        return [
          { area: "Ingeniería de Software", solicitudes: 120 },
          { area: "Inteligencia Artificial", solicitudes: 95 },
          { area: "Ciberseguridad", solicitudes: 80 },
          { area: "Ciencia de Datos", solicitudes: 75 },
          { area: "Gestión de Proyectos", solicitudes: 60 }
        ].slice(0, limit);
      },
    }),
  ];
};
