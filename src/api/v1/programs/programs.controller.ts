import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ProgramsService } from "./programs.service";
import { CreateProgramDto } from "./dto/create-program.dto";
import { UpdateProgramDto } from "./dto/update-program.dto";

@Controller("programs")
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) { }

  @Get()
  async findAll(@Query() query: any) {
    const data = await this.programsService.findAll(query);
    return { success: true, data, error: null };
  }

  @Get(':id')
  async buscar(@Param('id') id: string) {
    const data = await this.programsService.findOne(id);
    return { success: true, data, error: null };
  }

  @Post()
  async crear(@Body() createProgramDto: CreateProgramDto) {
    const data = await this.programsService.create(createProgramDto);
    return { success: true, data, error: null };
  }

  @Put(':id')
  async actualizar(@Param('id') id: string, @Body() updateProgramDto: UpdateProgramDto) {
    await this.programsService.update(id, updateProgramDto);
    return { success: true, data: null, error: null };
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    await this.programsService.remove(id);
    return { success: true, data: null, error: null };
  }

  @Get(':id/levels')
  async listarNiveles(@Param('id') id: string) {
    const data = await this.programsService.getLevels(id);
    return { success: true, data, error: null };
  }
}
