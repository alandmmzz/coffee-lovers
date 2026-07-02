import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import sql from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.email) return;
      try {
        await sql`
          insert into users (email, name, image, last_seen_at)
          values (${user.email}, ${user.name ?? null}, ${user.image ?? null}, now())
          on conflict (email) do update set
            name = excluded.name,
            image = excluded.image,
            last_seen_at = now()
        `;
      } catch (err) {
        console.error("Error al registrar login de usuario:", err);
      }
    },
  },
  pages: {
    // usamos el dropdown propio para iniciar sesión, no la pantalla default de NextAuth
  },
};
