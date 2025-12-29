import supertokens from 'supertokens-node';
import ThirdParty from 'supertokens-node/recipe/thirdparty';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import Session from 'supertokens-node/recipe/session';
import UserRoles from 'supertokens-node/recipe/userroles';
import { getUser, User } from 'supertokens-node';
import { PrismaService } from './prisma.service';
import { access } from 'fs';
import SuperTokens from 'supertokens-node';

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
      //TODO: delete role from user in the future
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
                return response;
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
                return response;
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
                return response;
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
          functions: (originalImplementation) => ({
            ...originalImplementation,
            createNewSession: async (input) => {
              const userRoles = await UserRoles.getRolesForUser(
                input.tenantId,
                input.userId,
              );

              let email = '';
              const user = await SuperTokens.getUser(input.userId);

              if (user !== undefined) {
                email = user.emails[0];
              }
              input.accessTokenPayload = {
                ...input.accessTokenPayload,
                roles: userRoles,
                email: email,
              };

              return originalImplementation.createNewSession(input);
            },
          }),
        },
      }),
    ],
  });
}
