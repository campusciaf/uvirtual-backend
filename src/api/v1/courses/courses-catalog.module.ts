import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseCatalog } from './entities/course-catalog.entity';
import { Course } from './entities/course.entity';
import { CoursesCatalogService } from './courses-catalog.service';
import { CoursesCatalogController } from './courses-catalog.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseCatalog, Course]),
  ],
  controllers: [CoursesCatalogController],
  providers: [CoursesCatalogService],
  exports: [CoursesCatalogService],
})
export class CoursesCatalogModule {}