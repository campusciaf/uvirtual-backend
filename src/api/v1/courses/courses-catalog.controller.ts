import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CoursesCatalogService } from './courses-catalog.service';
import { CreateCourseCatalogDto } from './dto/create-course-catalog.dto';

@Controller('courses-catalog')
export class CoursesCatalogController {
  constructor(private readonly service: CoursesCatalogService) { }

  @Get()
  async findAll() {
    const data = await this.service.findAll();
    return { success: true, data };
  }

  @Post()
  async create(@Body() dto: CreateCourseCatalogDto) {
    const data = await this.service.create(dto);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: CreateCourseCatalogDto) {
    const data = await this.service.update(id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.service.remove(id);
    return { success: true, data };
  }
}