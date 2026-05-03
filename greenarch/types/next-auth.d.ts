/**
 * NextAuth extended session types
 * Extend the default NextAuth types if using NextAuth
 */

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'user' | 'partner' | 'gardener' | 'admin';
      image?: string;
    };
  }

  interface User {
    id: string;
    role: 'user' | 'partner' | 'gardener' | 'admin';
  }
}
