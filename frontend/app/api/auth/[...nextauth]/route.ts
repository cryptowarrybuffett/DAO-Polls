import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import "@/lib/auth-types";

const handler = NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID ?? "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET ?? "",
      version: "2.0",
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        const data = (profile as Record<string, unknown>).data as
          | Record<string, unknown>
          | undefined;
        token.twitterHandle = data
          ? (data.username as string)
          : ((profile as Record<string, unknown>).screen_name as string);
      }
      return token;
    },
    async session({ session, token }) {
      if (token.twitterHandle) {
        session.twitterHandle = token.twitterHandle;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
