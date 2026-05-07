import { Body, Controller, Get, Post } from "@nestjs/common";
import { VoltAgentService } from "./voltagent.service";

@Controller({
  path: "voltagent",
  version: "1",
})
export class VoltAgentController {
  constructor(
    private readonly voltAgentService: VoltAgentService,
  ) { }

  @Post("process")
  async process(@Body() body: { text: string }): Promise<any> {
    if (!body.text) {
      return {
        error: "Please provide text to process",
      };
    }

    const result = await this.voltAgentService.appAdvisorAgent.generateText(
      body.text,
    );

    return {
      original: body.text,
      processed: result.text,
      usage: result.usage,
    };
  }
}