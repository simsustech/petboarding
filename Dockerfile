FROM node:lts AS tools-build

RUN --mount=type=secret,id=SIMSUSTECH_NPM_TOKEN printf "@modular-api:registry=https://npm.simsus.tech\n//npm.simsus.tech/:_authToken=%s\n" "$(cat /run/secrets/SIMSUSTECH_NPM_TOKEN)" >> ~/.npmrc

WORKDIR /build
RUN npm install -g pnpm
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/tools ./packages/tools
RUN pnpm install --frozen-lockfile --filter @petboarding/tools
RUN pnpm --filter @petboarding/tools run build

FROM node:lts AS install-stage

RUN --mount=type=secret,id=SIMSUSTECH_NPM_TOKEN printf "@modular-api:registry=https://npm.simsus.tech\n//npm.simsus.tech/:_authToken=%s\n" "$(cat /run/secrets/SIMSUSTECH_NPM_TOKEN)" >> ~/.npmrc

WORKDIR /build
RUN npm install -g pnpm
COPY --from=tools-build /build/packages/tools/dist ./packages/tools/dist
COPY . .
RUN rm -rf node_modules

# Copy local packages inside the packages/* workspace glob so the workspace
# install resolves their dependencies (unocss, fastify, etc.) and the app
# build can import them.
COPY --from=linked-quasar-components ./ /build/packages/quasar-components/
COPY --from=linked-vitrify ./ /build/packages/vitrify/
COPY --from=linked-unocss-preset-quasar ./ /build/packages/unocss-preset-quasar/
COPY --from=linked-modular-api-api ./ /build/packages/modular-api-api/
COPY --from=linked-modular-api-fastify-oidc ./ /build/packages/modular-api-fastify-oidc/
COPY --from=linked-modular-api-fastify-checkout ./ /build/packages/modular-api-fastify-checkout/
COPY --from=linked-modular-api-quasar-components ./ /build/packages/modular-api-quasar-components/

# Inject link: overrides into pnpm-workspace.yaml for every local package that
# has a package.json, then install. --no-frozen-lockfile is only used when linked
# packages are present, so the lockfile records the link: entries (and the
# linked package's own deps) and pnpm deploy can resolve them.
RUN node -e "const fs=require('fs'),path=require('path'),y=fs.readFileSync('pnpm-workspace.yaml','utf8'),pkgs='/build/packages';let ov={};fs.readdirSync(pkgs).forEach(d=>{let p=path.join(pkgs,d,'package.json');if(fs.existsSync(p)){let pkg=JSON.parse(fs.readFileSync(p,'utf8'));ov[pkg.name]='link:./packages/'+d}});if(Object.keys(ov).length){let ovBlock='overrides:\\n'+Object.entries(ov).map(([k,v])=>'  \"'+k+'\": \"'+v+'\"').join('\\n')+'\\n';let n=y.replace(/^overrides:[\s\S]*?(?=\n\S|$)/m,'');fs.writeFileSync('pnpm-workspace.yaml',ovBlock+'\n'+n);fs.writeFileSync('/tmp/has-linked','')}" \
  && if [ -f /tmp/has-linked ]; then pnpm install --no-frozen-lockfile; else pnpm install --frozen-lockfile; fi

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

# Build any local packages so their dist/ exists for the app build and deploy
RUN for pkg in /build/packages/modular-api-* /build/packages/quasar-components /build/packages/vitrify /build/packages/unocss-preset-quasar; do \
      if [ -f "$pkg/package.json" ]; then \
        echo "[local] building $(basename "$pkg")..." && \
        (cd "$pkg" && pnpm run build); \
      fi; \
    done || true

RUN if [ "$DEBUG" = "true" ]; then pnpm run build:debug; else pnpm run build; fi

FROM build-stage AS api-deploy
# Remove circular dependency
# RUN pnpm -C packages/app remove @petboarding/api
# RUN pnpm prune --prod
RUN --mount=type=secret,id=SIMSUSTECH_NPM_TOKEN printf "@modular-api:registry=https://npm.simsus.tech\n//npm.simsus.tech/:_authToken=%s\n" "$(cat /run/secrets/SIMSUSTECH_NPM_TOKEN)" >> ~/.npmrc
RUN pnpm --filter @petboarding/api deploy api --prod
RUN pnpm --filter @petboarding/app deploy app --prod --no-optional
RUN rm ~/.npmrc

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