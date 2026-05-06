import { Agent } from "@voltagent/core";
import { Logger } from "@nestjs/common";
import { buildAcademicSubagent } from "./academic.subagent";
import { buildSupportSubagent } from "./support.subagent";
import { buildGeneralInfoSubagent } from "./general-info.subagent";
import { buildFinancialSubagent } from "./financial.subagent";

const logger = new Logger('AppAdvisorAgent');

export const buildAppAdvisorAgent = () => {
  return new Agent({
    name: "app-advisor",
    instructions: `Eres el conserje principal de UVirtual. Tu único trabajo es entender qué necesita el usuario y delegar la tarea al subagente experto correcto (Académico, Soporte, Info General o Financiero). 
Ten en cuenta el contexto de la vista en la que se encuentra el usuario para enrutar mejor la consulta. No respondas directamente preguntas complejas.`,
    model: "openai/gpt-4o-mini", // Formato de modelo compatible con la config previa de VoltAgent
    subAgents: [
      buildAcademicSubagent(),
      buildSupportSubagent(),
      buildGeneralInfoSubagent(),
      buildFinancialSubagent()
    ],
    hooks: {
      onStart: async ({ context }) => {
        // El frontend inyecta el JWT, el servidor lo parsea y VoltAgent lo expone en 'user'
        const user = context.context.get("user") as { id?: string; email?: string } | undefined;
        // El frontend también puede enviar la vista actual
        const currentView = context.context.get("currentView") as string | undefined;

        logger.log(`Agente iniciado para usuario ${user?.email || 'desconocido'} en vista ${currentView || 'general'}`);

        // Inyectamos un mensaje de sistema dinámico para darle contexto sobre la pantalla actual
        if (currentView) {
          context.context.set("system_message", `Contexto Actual: El usuario se encuentra en la pantalla/módulo de '${currentView}'. Prioriza respuestas relacionadas a este módulo.`);
        }
      },
    },
  });
};
