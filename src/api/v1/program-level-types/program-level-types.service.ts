import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { ProgramLevelTypes } from "./entities/program-level-types.entity";
import { CreateProgramLevelTypeDto } from "./dto/create-program-level-type.dto";
import { UpdateProgramLevelTypeDto } from "./dto/update-program-level-type.dto";

@Injectable()
export class ProgramLevelTypesService {
  constructor(
    @InjectRepository(ProgramLevelTypes)
    private readonly repo: Repository<ProgramLevelTypes>,
    private readonly dataSource: DataSource
  ) {}

  async findAll() {
    const items = await this.repo.find({ order: { created_at: 'ASC' } });
    return items.map(i => ({
      id: i.id,
      codigo: i.code,
      nombre: i.name,
      estado: i.status ? 'activo' : 'inactivo'
    }));
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Nivel no encontrado.');
    return {
      id: item.id,
      codigo: item.code,
      nombre: item.name,
      estado: item.status ? 'activo' : 'inactivo'
    };
  }

  async create(dto: CreateProgramLevelTypeDto) {
    const code = this.generarCode(dto.name);

    const existing = await this.repo.findOne({ where: { code } });
    if (existing) throw new ConflictException('Ya existe un nivel con ese nombre.');

    const entity = this.repo.create({
      code,
      name: dto.name,
      status: dto.status !== false
    });
    const saved = await this.repo.save(entity);
    return { id: saved.id };
  }

  private generarCode(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  async update(id: string, dto: UpdateProgramLevelTypeDto) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Nivel no encontrado.');

    if (dto.code && dto.code !== item.code) {
      const existing = await this.repo.findOne({ where: { code: dto.code } });
      if (existing) throw new ConflictException('El código ya existe.');
    }

    Object.assign(item, {
      code: dto.code ?? item.code,
      name: dto.name ?? item.name,
      status: dto.status !== undefined ? dto.status : item.status
    });
    await this.repo.save(item);
    return true;
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Nivel no encontrado.');

    const enUso = await this.dataSource
      .getRepository('programs_level')
      .createQueryBuilder('pl')
      .where('pl.level = :code', { code: item.code })
      .getCount();

    if (enUso > 0) {
      throw new BadRequestException('No se puede eliminar: el nivel está siendo usado por uno o más programas.');
    }

    await this.repo.delete(id);
    return true;
  }
}