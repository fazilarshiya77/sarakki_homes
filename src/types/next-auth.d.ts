import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

// The CRM's User model carries a `role` (ADMIN/MANAGER/SALES_EXECUTIVE/
// CONTENT_MANAGER) that authorize() already returns and that jwt()/
// session() already thread through — this just gives that field a real
// type instead of the `any` casts that used to paper over it.
declare module "next-auth" {
  interface User extends DefaultUser {
    role?: string;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: string;
  }
}
