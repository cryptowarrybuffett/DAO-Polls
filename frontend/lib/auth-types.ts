import "next-auth";

declare module "next-auth" {
  interface Session {
    twitterHandle?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    twitterHandle?: string;
  }
}
