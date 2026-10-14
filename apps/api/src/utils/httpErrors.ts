import { Response } from 'express';

export function sendInternalError(res: Response, error: unknown, context: string, publicMessage: string) {
  console.error(`[${context}]`, error);
  return res.status(500).json({ error: publicMessage });
}
