import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // USUARIO ADMIN DEMO
        if (
          credentials?.email === "admin@email.com" &&
          credentials?.password === "Admin1234"
        ) {
          return { id: "1", name: "Admin", email: "admin@email.com", role: "admin" };
        }
        // USUARIO NORMAL DEMO
        if (
          credentials?.email === "demo@email.com" &&
          credentials?.password === "Demo1234"
        ) {
          return { id: "2", name: "Demo User", email: "demo@email.com", role: "user" };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth"
  }
});

export { handler as GET, handler as POST }; 