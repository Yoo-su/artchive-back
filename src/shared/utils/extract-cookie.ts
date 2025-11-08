import { Request } from 'express';

export const extractCookie = (req: Request, key: string): string | null => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies[key];
  }
  return token;
};
