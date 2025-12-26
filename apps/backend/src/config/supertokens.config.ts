import supertokens from 'supertokens-node';
import ThirdParty from 'supertokens-node/recipe/thirdparty';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import Session from 'supertokens-node/recipe/session';
import UserRoles from 'supertokens-node/recipe/userroles';
import { getUser, User } from 'supertokens-node';
import { PrismaService } from './prisma.service';

const prisma = new PrismaService();
const DEFAULT_ROLE = 'user';

/**
 * Handles synchronization of a new user with the local database and assigns a default role.
 */
async function handleNewUserSync(
  user: User,
  email: string | undefined,
  tenantId: string,
) {
  if (!email) return;

  try {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        id: email,
        username: user.id,
        email: email,
      },
    });

    const results = await Promise.all([
      UserRoles.addRoleToUser(tenantId, user.id, 'user'),
      UserRoles.addRoleToUser(tenantId, user.id, 'new_user'),
    ]);

    if (results.some((r) => r.status !== 'OK')) {
      console.error('[Auth] Failed to assign roles:', results);
    } else {
      console.log(`[Auth] New user synced and role assigned: ${email}`);
    }
  } catch (error) {
    console.error('[Auth] Error during handleNewUserSync:', error);
  }
}

export async function ensureDefaultRolesExist() {
  try {
    await Promise.all([
      UserRoles.createNewRoleOrAddPermissions(DEFAULT_ROLE, []),
      UserRoles.createNewRoleOrAddPermissions('new_user', []),
      UserRoles.createNewRoleOrAddPermissions('admin', []),
    ]);
  } catch (error) {
    console.error('Failed to create default roles:', error);
  }
}

export function initializeSuperTokens() {
  const apiDomain = process.env.API_DOMAIN || 'http://localhost:3000';

  supertokens.init({
    appInfo: {
      appName: 'Readsy',
      apiDomain,
      websiteDomain: process.env.WEBSITE_DOMAIN || 'http://localhost:5173',
      apiBasePath: '/auth',
      websiteBasePath: '/auth',
    },
    supertokens: {
      connectionURI:
        process.env.SUPERTOKENS_CONNECTION_URI || 'http://localhost:3567',
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
                    clientType: 'web',
                    clientId: process.env.GOOGLE_CLIENT_ID!,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                    scope: ['openid', 'email', 'profile'],
                  },
                  {
                    clientType: 'android',
                    clientId: process.env.GOOGLE_CLIENT_ID!,
                    scope: ['openid', 'email', 'profile'],
                  },
                ],
              },
            },
          ],
        },
        override: {
          functions: (original) => ({
            ...original,
            signInUp: async (input) => {
              const res = await original.signInUp(input);
              if (res.status === 'OK' && res.createdNewRecipeUser) {
                await handleNewUserSync(
                  res.user,
                  res.user.emails[0],
                  input.tenantId,
                );
              }
              return res;
            },
          }),
          apis: (originalImplementation) => ({
            ...originalImplementation,
            signInUpPOST: async (input) => {
              const response =
                await originalImplementation.signInUpPOST!(input);
              if (response.status === 'OK') {
                const tenantId = response.user.tenantIds[0];
                const roles = await UserRoles.getRolesForUser(
                  tenantId,
                  response.user.id,
                );
                console.log(
                  `[Auth] ThirdParty SignInUpPOST: User ${response.user.id} has roles:`,
                  roles.roles,
                );
                console.log(
                  '[Auth] Full response with roles:',
                  JSON.stringify(
                    {
                      status: response.status,
                      userId: response.user.id,
                      roles: roles.roles,
                    },
                    null,
                    2,
                  ),
                );
                return {
                  ...response,
                  // @ts-ignore
                  roles: roles.roles,
                };
              }
              console.log(
                '[Auth] ThirdParty SignInUpPOST failed:',
                response.status,
              );
              return response;
            },
          }),
        },
      }),

      EmailPassword.init({
        override: {
          functions: (original) => ({
            ...original,
            signUp: async (input) => {
              const res = await original.signUp(input);
              if (res.status === 'OK') {
                const email = res.user.emails[0] || input.email;
                await handleNewUserSync(res.user, email, input.tenantId);
              }
              return res;
            },
          }),
          apis: (originalImplementation) => ({
            ...originalImplementation,
            signInPOST: async (input) => {
              const response = await originalImplementation.signInPOST!(input);
              if (response.status === 'OK') {
                const tenantId = response.user.tenantIds[0];
                const roles = await UserRoles.getRolesForUser(
                  tenantId,
                  response.user.id,
                );
                console.log(
                  `[Auth] SignInPOST: User ${response.user.id} has roles:`,
                  roles.roles,
                );
                console.log(
                  '[Auth] EmailPassword SignIn Full response:',
                  JSON.stringify(
                    {
                      status: response.status,
                      userId: response.user.id,
                      roles: roles.roles,
                    },
                    null,
                    2,
                  ),
                );
                return {
                  ...response,
                  // @ts-ignore
                  roles: roles.roles,
                };
              }
              console.log('[Auth] SignInPOST failed:', response.status);
              return response;
            },
            signUpPOST: async (input) => {
              const response = await originalImplementation.signUpPOST!(input);
              if (response.status === 'OK') {
                const tenantId = response.user.tenantIds[0];
                const roles = await UserRoles.getRolesForUser(
                  tenantId,
                  response.user.id,
                );
                console.log(
                  `[Auth] SignUpPOST: User ${response.user.id} has roles:`,
                  roles.roles,
                );
                console.log(
                  '[Auth] EmailPassword SignUp Full response:',
                  JSON.stringify(
                    {
                      status: response.status,
                      userId: response.user.id,
                      roles: roles.roles,
                    },
                    null,
                    2,
                  ),
                );
                return {
                  ...response,
                  // @ts-ignore
                  roles: roles.roles,
                };
              }
              console.log('[Auth] SignUpPOST failed:', response.status);
              return response;
            },
          }),
        },
      }),

      UserRoles.init(),

      Session.init({
        override: {
          functions: (original) => ({
            ...original,
            createNewSession: async (input) => {
              const [userRoles, user] = await Promise.all([
                UserRoles.getRolesForUser(input.tenantId, input.userId),
                getUser(input.userId),
              ]);

              const userEmail = user?.loginMethods[0]?.email || null;
              console.log(
                `[Auth] Creating session for user ${input.userId}. Tenant: ${input.tenantId}. Roles:`,
                userRoles.roles,
              );
              console.log(
                '[Auth] Session payload:',
                JSON.stringify(
                  {
                    userId: input.userId,
                    tenantId: input.tenantId,
                    roles: userRoles.roles,
                    email: userEmail,
                  },
                  null,
                  2,
                ),
              );
              return original.createNewSession({
                ...input,
                accessTokenPayload: {
                  ...input.accessTokenPayload,
                  roles: userRoles.roles,
                  email: userEmail,
                },
              });
            },
          }),
        },
      }),
    ],
  });
}
