import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ProgramLevelTypesService } from "./program-level-types.service";
import { CreateProgramLevelTypeDto } from "./dto/create-program-level-type.dto";
import { UpdateProgramLevelTypeDto } from "./dto/update-program-level-type.dto";

@Controller("program-level-types")
export class ProgramLevelTypesController {
  constructor(private readonly service: ProgramLevelTypesService) {}

  @Get()
  async listar() {
    const data = await this.service.findAll();
    return { success: true, data, error: null };
  }

  @Get(':id')
  async buscar(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { success: true, data, error: null };
  }

  @Post()
  async crear(@Body() dto: CreateProgramLevelTypeDto) {
    const data = await this.service.create(dto);
    return { success: true, data, error: null };
  }

  @Put(':id')
  async actualizar(@Param('id') id: string, @Body() dto: UpdateProgramLevelTypeDto) {
    await this.service.update(id, dto);
    return { success: true, data: null, error: null };
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    await this.service.remove(id);
    return { success: true, data: null, error: null };
  }
}