import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Programs } from "./entities/programs.entity";
import { ProgramsLevel } from "./entities/programs-level.entity";
import { CreateProgramDto } from "./dto/create-program.dto";
import { UpdateProgramDto } from "./dto/update-program.dto";

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Programs)
    private readonly programsRepo: Repository<Programs>,
    @InjectRepository(ProgramsLevel)
    private readonly programsLevelRepo: Repository<ProgramsLevel>,
    private readonly dataSource: DataSource
  ) { }
  private mapModalityToFront(m: string): string {
    switch(m) {
      case 'PRESENTIAL': return 'presencial';
      case 'VIRTUAL': return 'virtual';
      case 'MIXED': return 'mixta';
      default: return m?.toLowerCase();
    }
  }

  private mapTitrationToFront(t: string): string {
    switch(t) {
      case 'PROPEDEUTIC': return 'propedeutico';
      case 'SINGLE_CYCLE': return 'ciclo_unico';
      default: return t?.toLowerCase();
    }
  }
  async findAll() {
    const programs = await this.programsRepo
      .createQueryBuilder('p')
      .leftJoinAndMapMany('p.levels', ProgramsLevel, 'l', 'l.program_id = p.id')
      .orderBy('p.id', 'DESC')
      .getMany();

    return programs.map(p => {
      // Sort levels by order
      const sortedLevels = (p['levels'] || []).sort((a, b) => a.order - b.order);
      return {
        id: p.id,
        codigo: p.code,
        nombre: p.name,
        area_conocimiento: p.area_knowledge,
        modalidad: this.mapModalityToFront(p.modality),
        // metodologia: p.methodology,
        tipo_titulacion: this.mapTitrationToFront(p.titration_type),
        estado: p.state ? 'activo' : 'inactivo',
        total_niveles: sortedLevels.length,
        niveles: sortedLevels.length > 0
          ? sortedLevels.map(l => `${l.order}. ${l.level}`).join(' | ')
          : '—',
        niveles_data: sortedLevels.map(l => ({
          id: l.id,
          nivel: l.level,
          orden: l.order,
          titulo_otorgado: l.awarded_degree,
          duracion_semestres: l.duration_semesters,
          total_creditos: l.total_credits,
          estado: l.status ? 'activo' : 'inactivo'
        }))
      };
    });
  }

  async findOne(id: string) {
    const program = await this.programsRepo.findOne({ where: { id } });
    if (!program) {
      throw new NotFoundException('Programa no encontrado.');
    }

    const levels = await this.programsLevelRepo.find({
      where: { program_id: id },
      order: { order: 'ASC' }
    });

    return {
      id: program.id,
      codigo: program.code,
      nombre: program.name,
      area_conocimiento: program.area_knowledge,
      modalidad: this.mapModalityToFront(program.modality),
      // metodologia: program.methodology,
      tipo_titulacion: this.mapTitrationToFront(program.titration_type),
      estado: program.state ? 'activo' : 'inactivo',
      niveles_data: levels.map(l => ({
        id: l.id,
        nivel: l.level,
        orden: l.order,
        titulo_otorgado: l.awarded_degree,
        duracion_semestres: l.duration_semesters,
        total_creditos: l.total_credits,
        estado: l.status ? 'activo' : 'inactivo'
      }))
    };
  }

  async create(createProgramDto: CreateProgramDto) {
    const existing = await this.programsRepo.findOne({ where: { code: createProgramDto.code } });
    if (existing) {
      throw new ConflictException('El código del programa ya existe.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const program = this.programsRepo.create({
        code: createProgramDto.code,
        name: createProgramDto.name,
        area_knowledge: createProgramDto.area_knowledge,
        modality: createProgramDto.modality.toUpperCase(),
        // methodology: createProgramDto.methodology,
        titration_type: createProgramDto.titration_type.toUpperCase(),
        state: createProgramDto.state !== false, // default true
      });

      const savedProgram = await queryRunner.manager.save(program);

      if (createProgramDto.levels && createProgramDto.levels.length > 0) {
        const levelsToSave = createProgramDto.levels.map(l => this.programsLevelRepo.create({
          program_id: savedProgram.id,
          level: l.level,
          order: l.order,
          awarded_degree: l.awarded_degree,
          duration_semesters: l.duration_semesters,
          total_credits: l.total_credits,
          status: l.status !== false
        }));
        await queryRunner.manager.save(levelsToSave);
      }

      await queryRunner.commitTransaction();
      return { id: savedProgram.id };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, updateProgramDto: UpdateProgramDto) {
    const program = await this.programsRepo.findOne({ where: { id } });
    if (!program) {
      throw new NotFoundException('Programa no encontrado.');
    }

    if (updateProgramDto.code && updateProgramDto.code !== program.code) {
      const existing = await this.programsRepo.findOne({ where: { code: updateProgramDto.code } });
      if (existing) {
        throw new ConflictException('El código del programa ya existe.');
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      Object.assign(program, {
        code: updateProgramDto.code ?? program.code,
        name: updateProgramDto.name ?? program.name,
        area_knowledge: updateProgramDto.area_knowledge ?? program.area_knowledge,
        modality: updateProgramDto.modality ? updateProgramDto.modality.toUpperCase() : program.modality,
        // methodology: updateProgramDto.methodology ?? program.methodology,
        titration_type: updateProgramDto.titration_type ? updateProgramDto.titration_type.toUpperCase() : program.titration_type,
        state: updateProgramDto.state !== undefined ? updateProgramDto.state : program.state,
      });

      await queryRunner.manager.save(program);

      if (updateProgramDto.levels) {
        // Remove old levels
        await queryRunner.manager.delete(ProgramsLevel, { program_id: id });

        // Insert new ones
        if (updateProgramDto.levels.length > 0) {
          const levelsToSave = updateProgramDto.levels.map(l => this.programsLevelRepo.create({
            program_id: id,
            level: l.level,
            order: l.order,
            awarded_degree: l.awarded_degree,
            duration_semesters: l.duration_semesters,
            total_credits: l.total_credits,
            status: l.status !== false
          }));
          await queryRunner.manager.save(levelsToSave);
        }
      }

      await queryRunner.commitTransaction();
      return true;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const program = await this.programsRepo.findOne({ where: { id } });
    if (!program) {
      throw new NotFoundException('Programa no encontrado.');
    }

    // TypeORM should handle cascading or we can delete manually if no cascade setup.
    // Let's delete manually to be safe.
    await this.programsLevelRepo.delete({ program_id: id });
    await this.programsRepo.delete(id);
    return true;
  }

  async getLevels(id: string) {
    const levels = await this.programsLevelRepo.find({
      where: { program_id: id },
      order: { order: 'ASC' }
    });
    return levels.map(l => ({
      id: l.id,
      nivel: l.level,
      orden: l.order,
      titulo_otorgado: l.awarded_degree,
      duracion_semestres: l.duration_semesters,
      total_creditos: l.total_credits,
      estado: l.status ? 'activo' : 'inactivo'
    }));
  }
}