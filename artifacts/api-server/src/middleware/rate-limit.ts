import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

/**
 * Rate limiting for authentication endpoints
 * 5 attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many login attempts, please try again later",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip successful logins from rate limiting
  skip: (req: Request, res: Response) => {
    return res.statusCode === 200;
  },
});

/**
 * Rate limiting for general API endpoints
 * 100 requests per 15 minutes per user
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiting for file uploads
 * 10 uploads per hour per user
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: "Too many uploads, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
