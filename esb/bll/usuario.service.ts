/**
 * ESB - BLL - Servicio de Usuarios
 * Logica de negocio para gestion de usuarios
 */

import { usuarioRepository } from '../dal';
import type { Usuario } from '../models/entities';
import { ESBLogger } from '../utils/soap-utils';
import { createPasswordHash } from '../utils/password';

const logger = ESBLogger.getInstance();

export type CrearUsuarioInput = Omit<Usuario, 'idUsuario' | 'fechaRegistro' | 'passwordHash'> & {
  password: string;
};

export type ActualizarUsuarioInput = Partial<
  Omit<Usuario, 'passwordHash' | 'idUsuario' | 'fechaRegistro'>
> & { password?: string };

export class UsuarioService {
  async obtenerUsuarios(): Promise<Usuario[]> {
    logger.info('Obteniendo todos los usuarios');
    return usuarioRepository.findAll();
  }

  async obtenerUsuarioPorId(idUsuario: string): Promise<Usuario> {
    logger.info(`Obteniendo usuario con ID: ${idUsuario}`);
    const usuario = await usuarioRepository.findById(idUsuario);
    if (!usuario) {
      throw new Error(`Usuario con ID ${idUsuario} no encontrado`);
    }
    return usuario;
  }

  async crearUsuario(usuario: CrearUsuarioInput): Promise<Usuario> {
    logger.info('Creando nuevo usuario', { email: usuario.email });

    if (!usuario.email || !this.validarEmail(usuario.email)) {
      throw new Error('Email invalido');
    }

    const existente = await usuarioRepository.findByEmail(usuario.email);
    if (existente) {
      throw new Error(`El email ${usuario.email} ya esta registrado`);
    }

    const { password, activo, ...restoDatos } = usuario;
    const passwordHash = createPasswordHash(password);

    const datosBase = restoDatos as Omit<
      Usuario,
      'idUsuario' | 'fechaRegistro' | 'passwordHash' | 'activo'
    >;

    const nuevoUsuario: Usuario = {
      ...datosBase,
      passwordHash,
      fechaRegistro: new Date(),
      activo: activo ?? true
    };

    return usuarioRepository.create(nuevoUsuario);
  }

  async actualizarUsuario(idUsuario: string, usuario: ActualizarUsuarioInput): Promise<Usuario> {
    logger.info(`Actualizando usuario ${idUsuario}`);

    const existente = await usuarioRepository.findById(idUsuario);
    if (!existente) {
      throw new Error(`Usuario con ID ${idUsuario} no encontrado`);
    }

    if (usuario.email && usuario.email !== existente.email) {
      const conMismoEmail = await usuarioRepository.findByEmail(usuario.email);
      if (conMismoEmail) {
        throw new Error(`El email ${usuario.email} ya esta en uso`);
      }
    }

    const { password, ...resto } = usuario;
    const updatePayload: Partial<Usuario> = { ...resto };

    if (password) {
      updatePayload.passwordHash = createPasswordHash(password);
    }

    return usuarioRepository.update(idUsuario, updatePayload);
  }

  async eliminarUsuario(idUsuario: string): Promise<boolean> {
    logger.info(`Eliminando usuario ${idUsuario}`);

    const usuario = await usuarioRepository.findById(idUsuario);
    if (!usuario) {
      throw new Error(`Usuario con ID ${idUsuario} no encontrado`);
    }

    await usuarioRepository.update(idUsuario, { activo: false });
    return true;
  }

  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}

export const usuarioService = new UsuarioService();
