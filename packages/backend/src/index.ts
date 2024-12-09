/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */

import { createBackend } from '@backstage/backend-defaults';


//SignResolver

import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  authProvidersExtensionPoint,
  createOAuthProviderFactory,
} from '@backstage/plugin-auth-node';

import { githubAuthenticator } from '@backstage/plugin-auth-backend-module-github-provider';
import { gitlabAuthenticator } from '@backstage/plugin-auth-backend-module-gitlab-provider';
import { stringifyEntityRef } from '@backstage/catalog-model';

// import { RootHealthService, coreServices } from '@backstage/backend-plugin-api';

const backend = createBackend();

type AuthProviderId = 'github' | 'gitlab';

const customAuthResolver = createBackendModule({
  pluginId: 'auth',
  moduleId: 'custom-auth-provider',
  register(reg) {
    reg.registerInit({
      deps: { providers: authProvidersExtensionPoint },
      async init({ providers }) {
        const authProviders: AuthProviderId[] = ['github', 'gitlab']; // Lista tipada

        authProviders.forEach((providerId) => {
          providers.registerProvider({
            providerId,
            factory: createOAuthProviderFactory({
              authenticator: getAuthenticator(providerId),
              async signInResolver(info, ctx) {
                const { profile: { email } } = info;

                if (!email) {
                  throw new Error('User profile contained no email');
                }

                const [userId, domain] = email.split('@');

                if (domain !== 'gmail.com') {  // Ajuste para o domínio correto
                  throw new Error(
                    `Login failed, '${email}' does not belong to the expected domain`,
                  );
                }

                // criando a user entity
                const userEntity = stringifyEntityRef({
                  kind: 'User',
                  name: userId,
                  namespace: 'default',
                });
                // colocando o token
                return ctx.issueToken({
                  claims: {
                    sub: userEntity,
                    ent: [userEntity],
                  },
                });
              },
            }),
          });
        });
      },
    });
  },
});


// Função auxiliar com tipo explícito
function getAuthenticator(providerId: AuthProviderId) {
  switch (providerId) {
    case 'github':
      return githubAuthenticator;
    case 'gitlab':
      return gitlabAuthenticator; // Certifique-se de ter o autenticador do GitLab definido
    default:
      throw new Error(`No authenticator available for provider ${providerId}`);
  }
}


// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));

// See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
// backend.add(import('@backstage/plugin-auth-backend-module-guest-provider')); // Se for desenvolvimento
// backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));
// backend.add(import('@backstage/plugin-auth-backend-module-gitlab-provider'));
// See https://backstage.io/docs/auth/guest/provider
// if (process.env.NODE_ENV !== 'development') {
backend.add(customAuthResolver);
// }

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-techdocs-backend'));

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);
backend.add(import('@backstage/plugin-catalog-backend-module-github'));
backend.add(import('@backstage/plugin-catalog-backend-module-gitlab'));


// See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));
// See https://backstage.io/docs/permissions/getting-started for how to create your own permission policy
backend.add(
  import('@backstage/plugin-permission-backend-module-allow-all-policy'),
);

// search plugin
backend.add(import('@backstage/plugin-search-backend'));

// events plugins 
backend.add(import('@backstage/plugin-events-backend'));

// search engine
// See https://backstage.io/docs/features/search/search-engines
backend.add(import('@backstage/plugin-search-backend-module-pg'));

// search collators
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// kubernetes
backend.add(import('@backstage/plugin-kubernetes-backend'));

backend.start();
