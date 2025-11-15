import supertokens from 'supertokens-node';
import ThirdParty from 'supertokens-node/recipe/thirdparty';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import Session from 'supertokens-node/recipe/session';
import UserRoles from 'supertokens-node/recipe/userroles';
import { getUser } from 'supertokens-node';
import { PrismaService } from './prisma.service';

const prisma = new PrismaService();

export async function ensureDefaultRolesExist() {
  try {
    await UserRoles.createNewRoleOrAddPermissions('user', []);
  } catch (error) {
    console.error('Failed to create default roles:', error);
  }
}

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
        override: {
          functions: (originalImplementation) => {
            return {
              ...originalImplementation,
              signInUp: async function (input) {
                const response = await originalImplementation.signInUp(input);

                if (response.status === 'OK') {
                  const email =
                    response.user.emails && response.user.emails.length > 0
                      ? response.user.emails[0]
                      : null;
                  const isNewUser = response.createdNewRecipeUser;

                  if (isNewUser) {
                    console.log(
                      '[Google OAuth] New user created:',
                      response.user.id,
                    );
                    if (email != null) {
                      await prisma.user.create({
                        data: {
                          id: email,
                          username: response.user.id,
                          email: email,
                        },
                      });
                      console.log(
                        '[Google OAuth] User saved to Prisma DB:',
                        email,
                      );

                      console.log(
                        '[Google OAuth] Attempting to add role "user" to userId:',
                        response.user.id,
                      );
                      try {
                        const result = await UserRoles.addRoleToUser(
                          'public',
                          response.user.id,
                          'user',
                        );
                        console.log(
                          '[Google OAuth] Role assignment result:',
                          result,
                        );

                        // Verify role was added
                        const verifyRoles = await UserRoles.getRolesForUser(
                          'public',
                          response.user.id,
                        );
                        console.log(
                          '[Google OAuth] Verified roles for user:',
                          verifyRoles,
                        );
                      } catch (roleError) {
                        console.error(
                          '[Google OAuth] Failed to assign role:',
                          roleError,
                        );
                        // Don't throw - allow sign in to continue
                      }
                    }
                  }

                  if (email && input.session) {
                    await input.session.mergeIntoAccessTokenPayload({
                      email: email,
                    });
                  }
                }

                return response;
              },
            };
          },
        },
      }),
      EmailPassword.init({
        override: {
          functions: (originalImplementation) => {
            return {
              ...originalImplementation,
              signUp: async function (input) {
                const response = await originalImplementation.signUp(input);

                if (response.status === 'OK') {
                  console.log(
                    '[EmailPassword] New user signup:',
                    response.user.id,
                  );
                  const email =
                    response.user.emails && response.user.emails.length > 0
                      ? response.user.emails[0]
                      : input.email;

                  await prisma.user.create({
                    data: {
                      id: email,
                      username: response.user.id,
                      email: email,
                    },
                  });
                  console.log(
                    '[EmailPassword] User saved to Prisma DB:',
                    email,
                  );

                  console.log(
                    '[EmailPassword] Attempting to add role "user" to userId:',
                    response.user.id,
                  );
                  try {
                    const roleResult = await UserRoles.addRoleToUser(
                      'public',
                      response.user.id,
                      'user',
                    );
                    console.log(
                      '[EmailPassword] Role assignment result:',
                      roleResult,
                    );

                    // Verify role was added
                    const verifyRoles = await UserRoles.getRolesForUser(
                      'public',
                      response.user.id,
                    );
                    console.log(
                      '[EmailPassword] Verified roles for user:',
                      verifyRoles,
                    );
                  } catch (roleError) {
                    console.error(
                      '[EmailPassword] Failed to assign role:',
                      roleError,
                    );
                    // Don't throw - allow sign up to continue
                  }

                  if (input.session) {
                    await input.session.mergeIntoAccessTokenPayload({
                      email: email,
                    });
                  }
                }

                return response;
              },
              signIn: async function (input) {
                const response = await originalImplementation.signIn(input);

                if (response.status === 'OK') {
                  const email =
                    response.user.emails && response.user.emails.length > 0
                      ? response.user.emails[0]
                      : null;

                  if (email && input.session) {
                    await input.session.mergeIntoAccessTokenPayload({
                      email: email,
                    });
                  }
                }

                return response;
              },
            };
          },
        },
      }),
      UserRoles.init(),
      Session.init({
        override: {
          functions: (originalImplementation) => {
            return {
              ...originalImplementation,
              createNewSession: async function (input) {
                const userRoles = await UserRoles.getRolesForUser(
                  input.tenantId,
                  input.userId,
                );

                let userEmail: string | null = null;
                try {
                  const user = await getUser(input.userId);
                  if (
                    user &&
                    user.loginMethods &&
                    user.loginMethods.length > 0
                  ) {
                    userEmail = user.loginMethods[0].email || null;
                  }
                } catch (e) {
                  console.error('Failed to get user email:', e);
                }

                console.log(
                  `Creating session for user ${input.userId} with email: ${userEmail} and roles:`,
                  userRoles.roles,
                );

                return originalImplementation.createNewSession({
                  ...input,
                  accessTokenPayload: {
                    ...input.accessTokenPayload,
                    email: userEmail,
                    roles: userRoles.roles,
                  },
                });
              },
            };
          },
        },
      }),
    ],
  });
}
