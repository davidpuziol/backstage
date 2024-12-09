# [Backstage](https://backstage.io)

This is your newly scaffolded Backstage App, Good Luck!

To start the app, run:

```sh
yarn install
yarn dev
```

## Docker Local

````bash
docker build -t backstage . --no-cache

# Para rodar lembre de ter todas as variáveis exportadas
docker container run --rm --interactive --tty --publish 7007:7007 \
    --env NODE_ENV=development \
    --env GITHUB_ACCOUNT=$GITHUB_ACCOUNT \
    --env GITHUB_USER=$GITHUB_USER \
    --env GITHUB_USER=$GITHUB_USER \
    --env GITHUB_TOKEN=$GITHUB_TOKEN \
    --env GITLAB_TOKEN=$GITLAB_TOKEN \
    --env ARGOCD_AUTH_TOKEN_BACKSTAGE=$ARGOCD_AUTH_TOKEN_BACKSTAGE \
    --env AUTH_GITHUB_CLIENT_ID=$AUTH_GITHUB_CLIENT_ID \
    --env AUTH_GITHUB_CLIENT_SECRET=$AUTH_GITHUB_CLIENT_SECRET \
    --env AUTH_GITLAB_CLIENT_ID=$AUTH_GITLAB_CLIENT_ID \
    --env AUTH_GITLAB_CLIENT_SECRET=$AUTH_GITLAB_CLIENT_SECRET \
    --env KUBERNETES_BACKSTAGE_SA_TOKEN=$KUBERNETES_BACKSTAGE_SA_TOKEN \
    backstage node packages/backend --config app-config.yaml

# Subindo a imagem para o seu repositório
docker tag backstage:latest davidpuziol/backstage:v1.0.0
docker push davidpuziol/backstage:v1.0.0
````

## Kubernetes

É necessário uma secret com as variáveis no mesmo namespace que será rodado o backstage

````bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: backstage-env-secrets
  namespace: backstage
type: Opaque
data:
  POSTGRES_USER: "$(echo -n "$POSTGRES_USER" | base64)"
  POSTGRES_PASSWORD: "$(echo -n "$POSTGRES_PASSWORD" | base64)"
  GITHUB_ACCOUNT: "$(echo -n "$GITHUB_ACCOUNT" | base64)"
  GITHUB_TOKEN: "$(echo -n "$GITHUB_TOKEN" | base64)"
  GITLAB_TOKEN: "$(echo -n "$GITLAB_TOKEN" | base64)"
  ARGOCD_AUTH_TOKEN_BACKSTAGE: "$(echo -n "$ARGOCD_AUTH_TOKEN_BACKSTAGE" | base64)"
  AUTH_GITHUB_CLIENT_ID: "$(echo -n "$AUTH_GITHUB_CLIENT_ID" | base64)"
  AUTH_GITHUB_CLIENT_SECRET: "$(echo -n "$AUTH_GITHUB_CLIENT_SECRET" | base64)"
  AUTH_GITLAB_CLIENT_ID: "$(echo -n "$AUTH_GITLAB_CLIENT_ID" | base64)"
  AUTH_GITLAB_CLIENT_SECRET: "$(echo -n "$AUTH_GITLAB_CLIENT_SECRET" | base64)"
  KUBERNETES_BACKSTAGE_SA_TOKEN: "$(echo -n "$KUBERNETES_BACKSTAGE_SA_TOKEN" | base64)"
EOF
````

Agora vamos deployar usando o helm chart criado na pasta backstage, mas antes configura o values.yaml

````bash
cd backsgate
helm install backstage -n backstage .
````
