import type { NextAuthOptions } from 'next-auth'
import TwitterProvider from 'next-auth/providers/twitter'

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_API_KEY!,
      clientSecret: process.env.TWITTER_API_SECRET!,
      // OAuth 1.0A uses X's /authenticate endpoint which:
      // - Recognizes existing X sessions (no forced re-login)
      // - Auto-approves returning users (skip consent screen)
      // - Doesn't trigger "Suspicious login prevented"
      // OAuth 2.0 uses /authorize which forces re-auth → X blocks as suspicious
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    error: '/auth-error',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const p = profile as any
        // OAuth 1.0A profile structure: data is at top level
        token.twitterId = p.id_str || p.id || account.providerAccountId
        token.twitterHandle = p.screen_name || p.username || ''
        token.twitterImage = p.profile_image_url_https || p.profile_image_url || ''
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).twitterId = token.twitterId
        ;(session.user as any).twitterHandle = token.twitterHandle
        ;(session.user as any).twitterImage = token.twitterImage
      }
      return session
    },
    async signIn() {
      return true
    },
  },
  debug: process.env.NODE_ENV === 'development',
}
