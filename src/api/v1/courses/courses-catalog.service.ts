import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CourseCatalog } from "./entities/course-catalog.entity";
import { Course } from "./entities/course.entity";
import { CreateCourseCatalogDto } from "./dto/create-course-catalog.dto";

@Injectable()
export class CoursesCatalogService {
  constructor(
    @InjectRepository(CourseCatalog)
    private readonly catalogRepo: Repository<CourseCatalog>,
    @InjectRepository(Course)
    private readonly coursesRepo: Repository<Course>,
  ) { }

  async findAll() {
    const catalog = await this.catalogRepo
      .createQueryBuilder('c')
      .where('c.status = :status', { status: true })
      .orderBy('c.name', 'ASC')
      .getMany();

    const result = await Promise.all(catalog.map(async (c) => {
      const total_usos = await this.coursesRepo.count({ where: { catalog_id: c.id } });
      return {
        id: c.id,
        codigo: c.code,
        nombre: c.name,
        imagen: c.image_url,
        creditos: c.credits,
        horas_totales: c.total_hours,
        tipo: c.type?.toLowerCase() === 'obligatory' ? 'obligatoria' : 'electiva',
        estado: c.status ? 'activa' : 'inactiva',
        total_usos
      };
    }));

    return result;
  }

  async create(dto: CreateCourseCatalogDto) {
    const existing = await this.catalogRepo.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException('El código de la asignatura ya existe en el catálogo.');
    }

    const item = this.catalogRepo.create({
      code: dto.code,
      name: dto.name,
      image_url: dto.image_url,
      credits: dto.credits,
      total_hours: dto.total_hours,
      type: dto.type.toUpperCase(),
      status: dto.status !== false,
    });

    const saved = await this.catalogRepo.save(item);
    return { id: saved.id };
  }

  async update(id: string, dto: CreateCourseCatalogDto) {
    const item = await this.catalogRepo.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Asignatura del catálogo no encontrada.');
    }

    if (dto.code && dto.code !== item.code) {
      const existing = await this.catalogRepo.findOne({ where: { code: dto.code } });
      if (existing) {
        throw new ConflictException('El código de la asignatura ya existe en el catálogo.');
      }
    }

    Object.assign(item, {
      code: dto.code ?? item.code,
      name: dto.name ?? item.name,
      image_url: dto.image_url ?? item.image_url,
      credits: dto.credits ?? item.credits,
      total_hours: dto.total_hours ?? item.total_hours,
      type: dto.type ? dto.type.toUpperCase() : item.type,
      status: dto.status !== undefined ? dto.status : item.status,
    });

    await this.catalogRepo.save(item);
    return true;
  }

  async remove(id: string) {
    const item = await this.catalogRepo.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Asignatura del catálogo no encontrada.');
    }

    const usos = await this.coursesRepo.count({ where: { catalog_id: id } });
    if (usos > 0) {
      throw new ConflictException(`No se puede eliminar: la asignatura está en uso en ${usos} programa(s).`);
    }

    await this.catalogRepo.delete(id);
    return true;
  }
}