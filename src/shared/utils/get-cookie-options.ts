import { CookieOptions } from 'express';

export const getCookieOptions = (
  isProduction: boolean,
  customCookieOptions?: CookieOptions,
): CookieOptions => {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    ...customCookieOptions,
  };
};
