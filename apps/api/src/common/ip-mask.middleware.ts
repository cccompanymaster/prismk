import { Injectable, type NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

/**
 * Replaces the last IPv4 octet (or last IPv6 group) with `0` so any
 * downstream logger or persistence layer that reads `req.ipMasked`
 * is GDPR/PIPA-safe. The original `req.ip` is left intact for upstream
 * use (rate limiter), but downstream consumers should prefer the
 * masked variant.
 */
function maskIp(ip: string | undefined): string | undefined {
  if (!ip) return ip;
  const trimmed = ip.replace(/^::ffff:/, "");
  if (trimmed.includes(".")) {
    const parts = trimmed.split(".");
    if (parts.length === 4) {
      parts[3] = "0";
      return parts.join(".");
    }
  }
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    if (parts.length > 1) {
      parts[parts.length - 1] = "0";
      return parts.join(":");
    }
  }
  return trimmed;
}

interface RequestWithMaskedIp extends Request {
  ipMasked?: string;
}

@Injectable()
export class IpMaskMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    (req as RequestWithMaskedIp).ipMasked = maskIp(req.ip);
    next();
  }
}

/** Helper for downstream consumers (services / controllers). */
export function getMaskedIp(req: Request): string | undefined {
  return (req as RequestWithMaskedIp).ipMasked;
}
