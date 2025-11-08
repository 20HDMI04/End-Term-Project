import supertokens from 'supertokens-node';
import ThirdParty from 'supertokens-node/recipe/thirdparty';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import Session from 'supertokens-node/recipe/session';

export function initializeSuperTokens() {
  supertokens.init({
    appInfo: {
      appName: 'Readsy',
      apiDomain: 'http://localhost:3000',
      websiteDomain: 'http://localhost:5173',
      apiBasePath: '/auth',
      websiteBasePath: '/auth',
    },
    supertokens: {
      connectionURI: 'http://localhost:3567',
    },
    recipeList: [
      ThirdParty.init({
        signInAndUpFeature: {
          providers: [
            {
              config: {
                thirdPartyId: 'google',
                clients: [
                  {
                    clientId: process.env.GOOGLE_CLIENT_ID!,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                    scope: ['openid', 'email', 'profile'],
                  },
                ],
                authorizationEndpoint:
                  'https://accounts.google.com/o/oauth2/v2/auth',
                tokenEndpoint: 'https://oauth2.googleapis.com/token',
                userInfoEndpoint:
                  'https://www.googleapis.com/oauth2/v1/userinfo',
              },
            },
          ],
        },
      }),
      EmailPassword.init(),
      Session.init(),
    ],
  });
}
