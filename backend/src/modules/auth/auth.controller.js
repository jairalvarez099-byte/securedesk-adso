import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { z } from "zod";

import { prisma } from "../../lib/prisma.js";
import { auditLog } from "../../utils/audit.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function login(req, res, next) {
  try {
    const parsed = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
    });

    if (!user || !user.isActive) {
      auditLog("LOGIN_FAILED", req, {
        email: parsed.email,
        reason: user ? "usuario inactivo" : "usuario inexistente",
      });
      return res.status(401).json({ message: "Credenciales invalidas" });
    }

    const valid = await bcrypt.compare(parsed.password, user.passwordHash);

    if (!valid) {
      auditLog("LOGIN_FAILED", req, {
        email: parsed.email,
        reason: "contrasena incorrecta",
      });
      return res.status(401).json({ message: "Credenciales invalidas" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    auditLog("LOGIN_SUCCESS", req, {
      userId: user.id,
      role: user.role,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res) {
  return res.json({ user: req.user });
}
