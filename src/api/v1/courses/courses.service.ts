import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, Not } from "typeorm";
import { Course } from "./entities/course.entity";
import { PrerequisiteCourse } from "./entities/prerequisite-courses.entity";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { S3Service } from "../common/s3/s3.service";
import { ProgramsLevel } from "../programs/entities/programs-level.entity";
import { Programs } from "../programs/entities/programs.entity";

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(PrerequisiteCourse)
    private readonly prereqRepo: Repository<PrerequisiteCourse>,
    @InjectRepository(ProgramsLevel)
    private readonly programLevelRepo: Repository<ProgramsLevel>,
    @InjectRepository(Programs)
    private readonly programsRepo: Repository<Programs>,
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service
  ) {}

  private mapTypeToFront(t: string): string {
    switch(t) {
      case 'OBLIGATORY': return 'obligatoria';
      case 'ELECTIVE': return 'electiva';
      default: return t?.toLowerCase();
    }
  }

  private mapModalityToFront(m: string): string {
    switch(m) {
      case 'PRESENTIAL': return 'presential';
      case 'VIRTUAL': return 'virtual';
      case 'MIXED': return 'mixed';
      default: return m?.toLowerCase();
    }
  }

  private async getModalityByProgramLevel(programLevelId: string): Promise<string> {
    const level = await this.programLevelRepo.findOne({ where: { id: programLevelId } });
    if (!level) throw new NotFoundException('Nivel de programa no encontrado.');
    const program = await this.programsRepo.findOne({ where: { id: level.program_id } });
    if (!program) throw new NotFoundException('Programa no encontrado.');
    return program.modality;
  }

  async findByLevel(programLevelId: string) {
    const courses = await this.courseRepo.find({
      where: { program_level_id: programLevelId },
      order: { semester: 'ASC', order: 'ASC', name: 'ASC' }
    });

    const result: any[] = [];
    for (const c of courses) {
      const relations = await this.prereqRepo.find({ where: { course_id: c.id } });
      const prereqIds = relations.map(r => r.prerequisite_id);
      let prerrequisitos: { codigo: string; nombre: string }[] = [];
      if (prereqIds.length > 0) {
        const prereqCourses = await this.courseRepo.findByIds(prereqIds);
        prerrequisitos = prereqCourses.map(p => ({ codigo: p.code, nombre: p.name }));
      }
      let imagenUrl = '';
      if (c.image_url) {
        try {
          imagenUrl = await this.s3Service.getSignedUrl(c.image_url);
        } catch (e) {
          console.error('Error generando signed URL', e);
        }
      }
      result.push({
        id: c.id,
        nivel_programa_id: c.program_level_id,
        codigo: c.code,
        nombre: c.name,
        imagen: imagenUrl,
        semestre: c.semester,
        creditos: c.credits,
        horas_totales: c.total_hours,
        tipo: this.mapTypeToFront(c.type),
        modalidad: this.mapModalityToFront(c.modality),
        orden: c.order,
        estado: c.status ? 'activa' : 'inactiva',
        total_prerrequisitos: prereqIds.length,
        prerrequisitos
      });
    }

    return result;
  }

  async findCatalog(modality: string) {
    const modalityUpper = modality?.toUpperCase();
    if (!['PRESENTIAL', 'VIRTUAL', 'MIXED'].includes(modalityUpper)) {
      throw new BadRequestException('Modalidad inválida.');
    }

    const courses = await this.courseRepo.find({
      where: { modality: modalityUpper, status: true },
      order: { name: 'ASC' }
    });

    const seen = new Set<string>();
    const unique: Course[] = [];
    for (const c of courses) {
      const key = `${c.code}|${c.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(c);
      }
    }

    return unique.map(c => ({
      id: c.id,
      codigo: c.code,
      nombre: c.name,
      imagen: c.image_url,
      creditos: c.credits,
      horas_totales: c.total_hours,
      tipo: this.mapTypeToFront(c.type),
      modalidad: this.mapModalityToFront(c.modality),
      total_usos: courses.filter(x => x.code === c.code && x.name === c.name).length
    }));
  }

  async findOne(id: string) {
    const c = await this.courseRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Asignatura no encontrada.');

    const prereqs = await this.prereqRepo.find({ where: { course_id: id } });

    return {
      id: c.id,
      nivel_programa_id: c.program_level_id,
      codigo: c.code,
      nombre: c.name,
      imagen: c.image_url,
      semestre: c.semester,
      creditos: c.credits,
      horas_totales: c.total_hours,
      tipo: this.mapTypeToFront(c.type),
      modalidad: this.mapModalityToFront(c.modality),
      orden: c.order,
      estado: c.status ? 'activa' : 'inactiva',
      prerrequisito_ids: prereqs.map(p => p.prerequisite_id)
    };
  }

  async create(createCourseDto: CreateCourseDto) {
    const existCode = await this.courseRepo.findOne({
      where: { code: createCourseDto.code, program_level_id: createCourseDto.program_level_id }
    });
    if (existCode) throw new ConflictException('Ya existe una asignatura con este código en este nivel.');

    const existOrder = await this.courseRepo.findOne({
      where: { program_level_id: createCourseDto.program_level_id, order: createCourseDto.order }
    });
    if (existOrder) throw new ConflictException('Ya existe una asignatura con este orden en este nivel.');

    const modality = await this.getModalityByProgramLevel(createCourseDto.program_level_id);

    const course = this.courseRepo.create({
      program_level_id: createCourseDto.program_level_id,
      catalog_id: null,
      code: createCourseDto.code,
      name: createCourseDto.name,
      image_url: createCourseDto.image_url || '',
      credits: createCourseDto.credits,
      total_hours: createCourseDto.total_hours,
      type: createCourseDto.type,
      modality: modality,
      order: createCourseDto.order,
      semester: createCourseDto.semester,
      status: createCourseDto.status !== false,
    });

    const saved = await this.courseRepo.save(course);
    return { id: saved.id };
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    const course = await this.courseRepo.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Asignatura no encontrada.');

    if (updateCourseDto.code && updateCourseDto.code !== course.code) {
      const existCode = await this.courseRepo.findOne({
        where: { code: updateCourseDto.code, program_level_id: course.program_level_id }
      });
      if (existCode) throw new ConflictException('Ya existe una asignatura con este código en este nivel.');
    }

    if (updateCourseDto.order && updateCourseDto.order !== course.order) {
      const existOrder = await this.courseRepo.findOne({
        where: { program_level_id: course.program_level_id, order: updateCourseDto.order }
      });
      if (existOrder) throw new ConflictException('Ya existe una asignatura con este orden en este nivel.');
    }

    Object.assign(course, {
      code: updateCourseDto.code ?? course.code,
      name: updateCourseDto.name ?? course.name,
      credits: updateCourseDto.credits ?? course.credits,
      total_hours: updateCourseDto.total_hours ?? course.total_hours,
      type: updateCourseDto.type ?? course.type,
      order: updateCourseDto.order ?? course.order,
      semester: updateCourseDto.semester ?? course.semester,
      status: updateCourseDto.status !== undefined ? updateCourseDto.status : course.status,
    });

    await this.courseRepo.save(course);
    return true;
  }

  async remove(id: string) {
    const course = await this.courseRepo.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Asignatura no encontrada.');

    await this.prereqRepo.delete({ course_id: id });
    await this.prereqRepo.delete({ prerequisite_id: id });

    if (course.image_url) {
      try {
        await this.s3Service.deleteFile(course.image_url);
      } catch (e) {
        console.error('Error deleting image from S3', e);
      }
    }

    await this.courseRepo.delete(id);
    return true;
  }

  async getPrerequisites(courseId: string) {
    const relations = await this.prereqRepo.find({ where: { course_id: courseId } });
    const prereqIds = relations.map(r => r.prerequisite_id);
    if (prereqIds.length === 0) return [];

    const courses = await this.courseRepo.findByIds(prereqIds);
    return courses.map(c => ({
      prerrequisito_id: c.id,
      codigo: c.code,
      nombre: c.name,
      semestre: c.semester,
      orden: c.order
    }));
  }

  async getCandidatePrerequisites(courseId: string) {
  const course = await this.courseRepo.findOne({ where: { id: courseId } });
  if (!course) throw new NotFoundException('Asignatura no encontrada.');

  const currentLevel = await this.programLevelRepo.findOne({ where: { id: course.program_level_id } });
  if (!currentLevel) throw new NotFoundException('Nivel de programa no encontrado.');

  const levels = await this.programLevelRepo.find({ where: { program_id: currentLevel.program_id } });
  const levelIds = levels.map(l => l.id);

  const candidates = await this.courseRepo
    .createQueryBuilder('c')
    .where('c.program_level_id IN (:...levelIds)', { levelIds })
    .andWhere('c.id != :courseId', { courseId })
    .orderBy('c.semester', 'ASC')
    .addOrderBy('c.order', 'ASC')
    .addOrderBy('c.name', 'ASC')
    .getMany();

  return candidates.map(c => ({
    id: c.id,
    codigo: c.code,
    nombre: c.name,
    semestre: c.semester,
    orden: c.order
  }));
}

  async savePrerequisites(courseId: string, prerequisiteIds: string[]) {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Asignatura no encontrada.');

    const uniqueIds = Array.from(new Set(prerequisiteIds.filter(id => id)));

    if (uniqueIds.includes(courseId)) {
      throw new BadRequestException('Una asignatura no puede ser prerrequisito de sí misma.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(PrerequisiteCourse, { course_id: courseId });

      if (uniqueIds.length > 0) {
        const toSave = uniqueIds.map(pid => this.prereqRepo.create({
          course_id: courseId,
          prerequisite_id: pid
        }));
        await queryRunner.manager.save(toSave);
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

  async updateImage(id: string, file: any) {
    const course = await this.courseRepo.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Asignatura no encontrada.');

    const newUrl = await this.s3Service.uploadFile(file as any, `asignaturas/${course.program_level_id}`);

    if (course.image_url) {
      try {
        await this.s3Service.deleteFile(course.image_url);
      } catch (e) {
        console.error('Error deleting old image', e);
      }
    }

    course.image_url = newUrl;
    await this.courseRepo.save(course);

    return { imagen: newUrl };
  }

  async deleteImage(id: string) {
    const course = await this.courseRepo.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Asignatura no encontrada.');

    if (course.image_url) {
      try {
        await this.s3Service.deleteFile(course.image_url);
      } catch (e) {
        console.error('Error deleting image', e);
      }
      course.image_url = '';
      await this.courseRepo.save(course);
    }

    return true;
  }
}