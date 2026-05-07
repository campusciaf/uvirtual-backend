import { Agent } from "@voltagent/core";

export const buildGeneralInfoSubagent = () => {
  return new Agent({
    name: "general-info-agent",
    instructions: "Eres el embajador de UVirtual. Responde preguntas generales sobre la visión, misión, contacto o reglas generales de la institución educativa de manera amable y concisa.",
    model: "openai/gpt-4o-mini",
    tools: [],
  });
};
