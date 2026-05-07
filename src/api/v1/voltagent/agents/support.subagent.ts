import { Agent } from "@voltagent/core";
import { getVideoContentTools } from "../tools/video-content.tools";

export const buildSupportSubagent = () => {
  return new Agent({
    name: "support-agent",
    instructions: "Eres el especialista de soporte de UVirtual. Ayuda al usuario a resolver problemas técnicos o aprender a usar la plataforma buscando en los videos y manuales de ayuda.",
    model: "openai/gpt-4o-mini",
    tools: getVideoContentTools(),
  });
};
