import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CoursesService } from "./courses.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";

@Controller("courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get('level/:levelId')
  async listarAsignaturas(@Param('levelId') levelId: string) {
    const data = await this.coursesService.findByLevel(levelId);
    return { success: true, data, error: null };
  }
  
  @Get('catalog/:modality')
  async listarCatalogo(@Param('modality') modality: string) {
    const data = await this.coursesService.findCatalog(modality);
    return { success: true, data, error: null };
  }

  @Get(':id')
  async buscar(@Param('id') id: string) {
    const data = await this.coursesService.findOne(id);
    return { success: true, data, error: null };
  }

  @Post()
  async crear(@Body() createCourseDto: CreateCourseDto) {
    const data = await this.coursesService.create(createCourseDto);
    return { success: true, data, error: null };
  }

  @Put(':id')
  async actualizar(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    await this.coursesService.update(id, updateCourseDto);
    return { success: true, data: null, error: null };
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    await this.coursesService.remove(id);
    return { success: true, data: null, error: null };
  }

  @Get(':id/prerequisites')
  async listarPrerequisitos(@Param('id') id: string) {
    const data = await this.coursesService.getPrerequisites(id);
    return { success: true, data, error: null };
  }

  @Get(':id/candidate-prerequisites')
  async listarCandidatas(@Param('id') id: string) {
    const data = await this.coursesService.getCandidatePrerequisites(id);
    return { success: true, data, error: null };
  }

  @Post(':id/prerequisites')
  async guardarPrerequisitos(@Param('id') id: string, @Body('prerequisite_ids') ids: string[]) {
    await this.coursesService.savePrerequisites(id, ids);
    return { success: true, data: null, error: null };
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('imagen'))
  async subirImagen(@Param('id') id: string, @UploadedFile() file: any) {
    const data = await this.coursesService.updateImage(id, file);
    return { success: true, data, error: null };
  }

  @Delete(':id/image')
  async eliminarImagen(@Param('id') id: string) {
    await this.coursesService.deleteImage(id);
    return { success: true, data: null, error: null };
  }
}