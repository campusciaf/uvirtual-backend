import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoursesController } from "./courses.controller";
import { CoursesService } from "./courses.service";
import { Course } from "./entities/course.entity";
import { PrerequisiteCourse } from "./entities/prerequisite-courses.entity";
import { ProgramsLevel } from "../programs/entities/programs-level.entity";
import { Programs } from "../programs/entities/programs.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Course, PrerequisiteCourse, ProgramsLevel, Programs])],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [TypeOrmModule, CoursesService]
})
export class CoursesModule { }