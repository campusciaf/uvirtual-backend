import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProgramLevelTypes } from "./entities/program-level-types.entity";
import { ProgramLevelTypesController } from "./program-level-types.controller";
import { ProgramLevelTypesService } from "./program-level-types.service";

@Module({
  imports: [TypeOrmModule.forFeature([ProgramLevelTypes])],
  controllers: [ProgramLevelTypesController],
  providers: [ProgramLevelTypesService],
  exports: [ProgramLevelTypesService, TypeOrmModule]
})
export class ProgramLevelTypesModule {}