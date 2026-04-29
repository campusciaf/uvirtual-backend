import { Module } from "@nestjs/common";
import { ProgramsController } from "./programs.controller";
import { ProgramsService } from "./programs.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Programs } from "./entities/programs.entity";
import { ProgramsLevel } from "./entities/programs-level.entity";
import { StudentProgram } from "./entities/student-program.entity";
import { StudentProgramHistory } from "./entities/student-program-history.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Programs, ProgramsLevel, StudentProgram, StudentProgramHistory])],
  controllers: [ProgramsController],
  providers: [ProgramsService],
  exports: [ProgramsService, TypeOrmModule]
})
export class ProgramsModule { }