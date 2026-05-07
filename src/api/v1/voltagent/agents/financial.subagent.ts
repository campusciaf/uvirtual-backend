import { Agent } from "@voltagent/core";

export const buildFinancialSubagent = () => {
  return new Agent({
    name: "financial-agent",
    instructions: "Eres el experto financiero de UVirtual. Responde preguntas sobre pagos, matrículas, facturas, becas y fechas de corte. Si no tienes los datos a mano, pide disculpas indicando que pronto tendrás conexión en tiempo real al sistema de pagos.",
    model: "openai/gpt-4o-mini",
    tools: [],
  });
};
