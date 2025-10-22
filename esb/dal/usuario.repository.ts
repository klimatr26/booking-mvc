/**
 * ESB - DAL - Repositorio de Usuarios
 */

import { BaseRepository } from './base.repository';
import type { Usuario } from '../models/entities';

export class UsuarioRepository extends BaseRepository<Usuario> {
  constructor() {
    super('idUsuario');
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const usuarios = await this.findAll();
    return usuarios.find(u => u.email === email) || null;
  }

  async findActivos(): Promise<Usuario[]> {
    const usuarios = await this.findAll();
    return usuarios.filter(u => u.activo);
  }
}

export const usuarioRepository = new UsuarioRepository();
