import { describe, expect, it } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { IpMaskMiddleware, getMaskedIp } from "./ip-mask.middleware";

function runMiddleware(ip: string | undefined): Request {
  const req = { ip } as Request;
  const middleware = new IpMaskMiddleware();
  middleware.use(req, {} as Response, ((): void => {}) as NextFunction);
  return req;
}

describe("IpMaskMiddleware", () => {
  it("masks the last octet of an IPv4 address", () => {
    const req = runMiddleware("203.0.113.42");
    expect(getMaskedIp(req)).toBe("203.0.113.0");
  });

  it("strips the IPv4-mapped IPv6 prefix before masking", () => {
    const req = runMiddleware("::ffff:203.0.113.42");
    expect(getMaskedIp(req)).toBe("203.0.113.0");
  });

  it("masks the last group of an IPv6 address", () => {
    const req = runMiddleware("2001:db8::1234");
    expect(getMaskedIp(req)?.endsWith(":0")).toBe(true);
  });

  it("returns undefined when ip is undefined", () => {
    const req = runMiddleware(undefined);
    expect(getMaskedIp(req)).toBeUndefined();
  });
});
