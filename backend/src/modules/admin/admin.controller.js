import { z } from "zod";

import { prisma } from "../../lib/prisma.js";

const userIdSchema = z.coerce.number().int().positive();

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
};

export async function getStats(req, res, next) {
  try {
    const [activeUsers, totalIncidents] = await Promise.all([
      prisma.user.count({
        where: { isActive: true },
      }),
      prisma.incident.count(),
    ]);

    return res.json({
      ok: true,
      stats: {
        activeUsers,
        totalIncidents,
        serverTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function deactivateUser(req, res, next) {
  try {
    const id = userIdSchema.parse(req.params.id);

    if (id === req.user.id) {
      return res.status(400).json({
        message: "No puedes desactivar tu propia cuenta",
      });
    }

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: safeUserSelect,
    });

    return res.json({
      message: "Usuario desactivado",
      user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function activateUser(req, res, next) {
  try {
    const id = userIdSchema.parse(req.params.id);

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: safeUserSelect,
    });

    return res.json({
      message: "Usuario activado",
      user,
    });
  } catch (error) {
    return next(error);
  }
}
