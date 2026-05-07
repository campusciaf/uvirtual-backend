import { Agent } from "@voltagent/core";
import { getAcademicProgramsTools } from "../tools/academic-programs.tools";

export const buildAcademicSubagent = () => {
  return new Agent({
    name: "academic-agent",
    instructions: "Eres el experto académico de UVirtual. Responde preguntas sobre materias, programas, áreas de conocimiento, docentes y calificaciones usando tus herramientas. Responde siempre de manera formal y estructurada.",
    model: "openai/gpt-4o-mini",
    tools: getAcademicProgramsTools(),
  });
};
