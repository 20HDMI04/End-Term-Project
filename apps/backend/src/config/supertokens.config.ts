import supertokens from 'supertokens-node';
import ThirdParty from 'supertokens-node/recipe/thirdparty';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import Session from 'supertokens-node/recipe/session';
import UserRoles from 'supertokens-node/recipe/userroles';
import { User } from 'supertokens-node';
import { PrismaService } from 'src/prisma.service';
import SuperTokens from 'supertokens-node';

const prisma = new PrismaService();
const DEFAULT_ROLE = 'user';

/**
 * @summary Handles the synchronization of a new user from SuperTokens to the application's database and assigns appropriate roles.
 * @description This function checks if the user already exists in the application's database. If not, it creates a new user record with default profile picture URLs. It then assigns roles to the user based on whether they are the first user in the system (admin) or a regular user. Any errors during this process are logged to the console.
 * @param {User} user - The user object returned by SuperTokens after a successful sign-up or sign-in.
 * @param {string | undefined} email - The email address of the user, extracted from the SuperTokens user object.
 * @param {string} tenantId - The tenant ID associated with the user, used for role assignment.
 */
async function handleNewUserSync(
  user: User,
  email: string | undefined,
  tenantId: string,
) {
  if (!email) return;

  const userCount = await prisma.user.count();

  try {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        id: email,
        username: user.id,
        email: email,
        biggerProfilePicKey: null,
        smallerProfilePicKey: null,
        biggerProfilePic:
          'http://localhost:4566/user-pictures/anonymous-user.webp',
        smallerProfilePic:
          'http://localhost:4566/user-pictures/anonymous-user.webp',
      },
    });

    let roleToAssign: Promise<any>[] = [];

    if (userCount === 0) {
      console.log('[Auth] First user detected, assigning admin role.');
      roleToAssign.push(UserRoles.addRoleToUser(tenantId, user.id, 'user'));
      roleToAssign.push(UserRoles.addRoleToUser(tenantId, user.id, 'admin'));
      roleToAssign.push(UserRoles.addRoleToUser(tenantId, user.id, 'new_user'));
    } else {
      roleToAssign.push(UserRoles.addRoleToUser(tenantId, user.id, 'user'));
      roleToAssign.push(UserRoles.addRoleToUser(tenantId, user.id, 'new_user'));
    }

    const results = await Promise.all(roleToAssign);

    if (results.some((r) => r.status !== 'OK')) {
      console.error('[Auth] Failed to assign roles:', results);
    } else {
      console.log(`[Auth] New user synced and role assigned: ${email}`);
    }
  } catch (error) {
    console.error('[Auth] Error during handleNewUserSync:', error);
  }
}

/**
 * @summary Ensures that the default roles ('user', 'new_user', 'admin') exist in the SuperTokens user roles system.
 * @description This function attempts to create the default roles if they do not already exist. It uses the `createNewRoleOrAddPermissions` method, which will create the role if it doesn't exist or simply ensure it exists without modifying permissions if it does. Any errors encountered during this process are logged to the console.
 */
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

/**
 * @summary Initializes the SuperTokens authentication system with application information, connection settings, and recipe configurations.
 * @description This function sets up SuperTokens with the necessary configuration for the application, including API and website domains, connection URI, and recipe configurations for third-party authentication, email/password authentication, user roles, and session management. It also includes overrides for certain functions to handle custom behavior such as synchronizing new users and assigning roles upon sign-up or sign-in. The function should be called during the application's startup process to ensure that SuperTokens is properly initialized.
 */
export function initializeSuperTokens() {
  const apiDomain = process.env.API_DOMAIN || 'http://localhost:3002';

  // SuperTokens initialization with app info and recipe configurations.
  supertokens.init({
    // Application information configuration.
    appInfo: {
      appName: 'Readsy',
      apiDomain: apiDomain,
      websiteDomain: process.env.WEBSITE_DOMAIN || 'http://localhost:5173',
      apiBasePath: '/auth',
      websiteBasePath: '/auth',
    },
    // SuperTokens core connection configuration.
    supertokens: {
      connectionURI:
        process.env.SUPERTOKENS_CONNECTION_URI || 'http://localhost:3567',
    },
    // Recipe configurations with overrides for custom behavior.
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
                    clientId: process.env.GOOGLE_CLIENT_ID || 'DISABLED',
                    clientSecret:
                      process.env.GOOGLE_CLIENT_SECRET || 'DISABLED',
                    scope: ['openid', 'email', 'profile'],
                  },
                  {
                    clientType: 'android',
                    clientId: process.env.GOOGLE_CLIENT_ID || 'DISABLED',
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
            // Override signInUp to handle new user synchronization.
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
            // Override signUpPOST to assign default roles upon user registration.
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
            // Override signUpPOST to assign roles upon user registration.
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

      // Session initialization with custom access token payload.
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
