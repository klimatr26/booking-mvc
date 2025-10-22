/**
 * ESB - Data Access Layer - Repositorio Base
 * Proporciona operaciones CRUD básicas para todas las entidades
 */

export interface IRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(entity: T): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

/**
 * Repositorio en memoria (simulación de base de datos)
 * En producción, esto se conectaría a una base de datos real
 */
export abstract class BaseRepository<T extends { [key: string]: any }> implements IRepository<T> {
  protected storage: Map<string, T> = new Map();
  protected idField: string;

  constructor(idField: string = 'id') {
    this.idField = idField;
  }

  async findAll(): Promise<T[]> {
    return Array.from(this.storage.values());
  }

  async findById(id: string): Promise<T | null> {
    return this.storage.get(id) || null;
  }

  async create(entity: T): Promise<T> {
    const id = entity[this.idField] || this.generateId();
    const newEntity = { ...entity, [this.idField]: id };
    this.storage.set(id, newEntity);
    return newEntity;
  }

  async update(id: string, entity: Partial<T>): Promise<T> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Entidad con ID ${id} no encontrada`);
    }
    const updated = { ...existing, ...entity, [this.idField]: id };
    this.storage.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.storage.delete(id);
  }

  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async findByField(field: keyof T, value: any): Promise<T[]> {
    const all = await this.findAll();
    return all.filter(item => item[field] === value);
  }

  async exists(id: string): Promise<boolean> {
    return this.storage.has(id);
  }

  async count(): Promise<number> {
    return this.storage.size;
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }
}
