FROM node:lts AS install-stage

RUN --mount=type=secret,id=SIMSUSTECH_NPM_TOKEN echo "//npm.simsus.tech/:_authToken=$(cat /run/secrets/SIMSUSTECH_NPM_TOKEN)" >> ~/.npmrc

WORKDIR /build
RUN npm install -g pnpm
COPY . .
RUN rm -rf node_modules
RUN pnpm install --frozen-lockfile

FROM install-stage AS build-stage

ARG VITE_API_HOST
ARG VITE_OIDC_ISSUER
ARG VITE_OIDC_ISSUER_NAME
ARG VITE_OIDC_CLIENT_ID
ARG VITE_OIDC_REDIRECT_URI
ARG VITE_OIDC_EMAIL_CHANGE_URI
ARG VITE_OIDC_PASSWORD_CHANGE_URl
ARG VITE_TITLE
ARG VITE_ALLOWED_SPECIES
ARG SASS_VARIABLE_PRIMARY
ARG DEBUG=false
ENV CI=true

# Build and link any local packages provided via docker-compose additional_contexts
COPY --from=linked-quasar-components ./ /build/local-packages/quasar-components/
COPY --from=linked-vitrify ./ /build/local-packages/vitrify/
COPY --from=linked-unocss-preset-quasar ./ /build/local-packages/unocss-preset-quasar/
COPY --from=linked-modular-api-api ./ /build/local-packages/modular-api-api/
COPY --from=linked-modular-api-fastify-oidc ./ /build/local-packages/modular-api-fastify-oidc/
COPY --from=linked-modular-api-fastify-checkout ./ /build/local-packages/modular-api-fastify-checkout/
COPY --from=linked-modular-api-quasar-components ./ /build/local-packages/modular-api-quasar-components/

RUN for pkg in /build/local-packages/*/; do \
      if [ -f "$pkg/package.json" ]; then \
        echo "[local] building $(basename "$pkg")..." && \
        cd "$pkg" && pnpm install && pnpm run build; \
      fi; \
    done || true

WORKDIR /build
RUN for pkg in /build/local-packages/*/; do \
      if [ -f "$pkg/package.json" ]; then \
        echo "[local] linking $(basename "$pkg")..." && \
        pnpm link "$pkg"; \
      fi; \
    done

RUN if [ "$DEBUG" = "true" ]; then pnpm run build:debug; else pnpm run build; fi
RUN rm ~/.npmrc

FROM build-stage AS api-deploy
# Remove circular dependency
# RUN pnpm -C packages/app remove @petboarding/api
# RUN pnpm prune --prod
RUN pnpm --filter @petboarding/api deploy api --prod
RUN pnpm --filter @petboarding/app deploy app --prod --no-optional

WORKDIR "/build/app/dist/ssr/client"
RUN find . ! -name 'logo.svg' -type f -exec gzip {} +

FROM node:lts-slim AS api
LABEL "io.petboarding.vendor"="simsustech"
RUN apt-get update && apt-get install -y curl
WORKDIR /app
COPY --from=api-deploy /build/api /app
# COPY --from=api-deploy /build/app /packages/app
ENV HOST=0.0.0.0
ENV PORT=80
EXPOSE 80
CMD ["npm", "start"]
