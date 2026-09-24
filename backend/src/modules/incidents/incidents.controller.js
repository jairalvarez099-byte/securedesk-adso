import { z } from "zod";

import { prisma } from "../../lib/prisma.js";
import { sanitizeText } from "../../utils/sanitize.js";
import { auditLog } from "../../utils/audit.js";

const sanitizedString = (min, max) =>
  z
    .string()
    .transform((value) => sanitizeText(value))
    .pipe(z.string().min(min).max(max));

const incidentSchema = z
  .object({
    title: sanitizedString(3, 120),
    description: sanitizedString(5, 2000),
    severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
    reporterEmail: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((value) => value.toLowerCase()),
    containsPersonal: z.boolean(),
  })
  .strict();

const incidentSelect = {
  id: true,
  title: true,
  description: true,
  severity: true,
  reporterEmail: true,
  containsPersonal: true,
  createdAt: true,
  createdById: true,
};

function maskEmail(email) {
  const [local, domain] = email.split("@");

  if (!local || !domain) {
    return "***";
  }

  const visible = local.length === 1 ? local : local.slice(0, 2);

  return `${visible}***@${domain}`;
}

function serializeIncidentForUser(incident, role) {
  return {
    ...incident,
    reporterEmail:
      role === "ADMIN"
        ? incident.reporterEmail
        : maskEmail(incident.reporterEmail),
  };
}

export async function createIncident(req, res, next) {
  try {
    const input = incidentSchema.parse(req.body);

    const incident = await prisma.incident.create({
      data: {
        title: input.title,
        description: input.description,
        severity: input.severity,
        reporterEmail: input.reporterEmail,
        containsPersonal: input.containsPersonal,
        createdById: req.user.id,
      },
      select: incidentSelect,
    });

    auditLog("INCIDENT_CREATED", req, {
      incidentId: incident.id,
      severity: incident.severity,
    });

    const result = serializeIncidentForUser(incident, req.user.role);

    return res.status(201).json({
      incident: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function listIncidents(req, res, next) {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: incidentSelect,
    });

    const result = incidents.map((incident) =>
      serializeIncidentForUser(incident, req.user.role),
    );

    return res.json({
      incidents: result,
    });
  } catch (error) {
    return next(error);
  }
}
