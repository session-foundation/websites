import NextAuth, { type AuthOptions } from 'next-auth';

export const createAuthHandler = (options: AuthOptions) => {
  const authHandler = NextAuth(options);

  return {
    GET: authHandler,
    POST: authHandler,
  };
};
