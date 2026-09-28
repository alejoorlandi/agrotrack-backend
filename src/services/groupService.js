'use strict';

const { Group, Permission, User } = require('../models');

/**
 * Helper: lanza un error HTTP-friendly.
 */
const httpError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

class GroupService {
  /**
   * GET /api/groups
   * Retorna todos los grupos con sus permisos asociados.
   */
  async findAll() {
    return Group.findAll({
      include: [
        {
          model: Permission,
          as: 'permissions',
          attributes: ['id', 'codigo', 'descripcion'],
          through: { attributes: [] },
        },
      ],
      order: [['nombre', 'ASC']],
    });
  }

  /**
   * GET /api/groups/:id
   * Retorna un grupo por ID con permisos y conteo de usuarios.
   */
  async findById(id) {
    const group = await Group.findByPk(id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          attributes: ['id', 'codigo', 'descripcion'],
          through: { attributes: [] },
        },
        {
          model: User,
          as: 'users',
          attributes: ['id', 'email', 'estado'],
          through: { attributes: [] },
        },
      ],
    });

    if (!group) throw httpError('Grupo no encontrado', 404);
    return group;
  }

  /**
   * POST /api/groups
   * Crea un nuevo grupo y le asigna los permisos indicados.
   *
   * @param {Object} data - { nombre, descripcion?, permissionIds[] }
   */
  async create({ nombre, descripcion, permissionIds = [] }) {
    if (!nombre || !nombre.trim()) throw httpError('El nombre del grupo es obligatorio');

    const exists = await Group.findOne({ where: { nombre: nombre.trim() } });
    if (exists) throw httpError('Ya existe un grupo con ese nombre', 409);

    const group = await Group.create({
      nombre: nombre.trim(),
      descripcion: descripcion || null,
    });

    if (permissionIds.length > 0) {
      const permissions = await Permission.findAll({ where: { id: permissionIds } });
      if (permissions.length !== permissionIds.length) {
        throw httpError('Uno o más permissionIds no existen');
      }
      await group.setPermissions(permissions);
    }

    return this.findById(group.id);
  }

  /**
   * PUT /api/groups/:id
   * Modifica nombre, descripción y reasigna permisos.
   *
   * @param {string} id
   * @param {Object} data - { nombre?, descripcion?, permissionIds? }
   */
  async update(id, { nombre, descripcion, permissionIds }) {
    const group = await Group.findByPk(id);
    if (!group) throw httpError('Grupo no encontrado', 404);

    if (nombre !== undefined) {
      const taken = await Group.findOne({ where: { nombre: nombre.trim() } });
      if (taken && taken.id !== id) throw httpError('Ya existe otro grupo con ese nombre', 409);
      group.nombre = nombre.trim();
    }

    if (descripcion !== undefined) {
      group.descripcion = descripcion;
    }

    await group.save();

    // Reasignar permisos si se envió el array (puede ser vacío para quitar todos)
    if (permissionIds !== undefined) {
      if (!Array.isArray(permissionIds)) throw httpError('permissionIds debe ser un array');
      const permissions = await Permission.findAll({ where: { id: permissionIds } });
      if (permissions.length !== permissionIds.length) {
        throw httpError('Uno o más permissionIds no existen');
      }
      await group.setPermissions(permissions);
    }

    return this.findById(id);
  }

  /**
   * DELETE /api/groups/:id
   * Elimina el grupo SOLO si no tiene usuarios activos asociados.
   * Esto previene eliminar accidentalmente grupos en uso.
   */
  async delete(id) {
    const group = await Group.findByPk(id, {
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'estado'],
          through: { attributes: [] },
        },
      ],
    });

    if (!group) throw httpError('Grupo no encontrado', 404);

    // Verificar si tiene usuarios activos
    const activeUsers = group.users.filter((u) => u.estado === 'ACTIVO');
    if (activeUsers.length > 0) {
      throw httpError(
        `No se puede eliminar el grupo "${group.nombre}" porque tiene ${activeUsers.length} usuario(s) activo(s) asignado(s). Reasigna o desactiva los usuarios primero.`,
        409
      );
    }

    // Desvincula permisos y usuarios antes de eliminar
    await group.setPermissions([]);
    await group.setUsers([]);
    await group.destroy();

    return { message: `Grupo "${group.nombre}" eliminado correctamente` };
  }
}

module.exports = new GroupService();
