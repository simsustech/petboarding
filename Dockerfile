FROM node:lts as install-stage

RUN --mount=type=secret,id=SIMSUSTECH_NPM_TOKEN echo "//npm.simsus.tech/:_authToken=$(cat /run/secrets/SIMSUSTECH_NPM_TOKEN)" > ~/.npmrc

WORKDIR /build
RUN npm install -g pnpm
COPY . .
RUN rm -rf node_modules
RUN pnpm install --frozen-lockfile
RUN rm ~/.npmrc

FROM install-stage as build-stage
# App env arguments
ARG VITE_API_HOSTNAME
ARG VITE_OIDC_ISSUER
ARG VITE_OIDC_ISSUER_NAME
ARG VITE_OIDC_CLIENT_ID
ARG VITE_OIDC_REDIRECT_URI
ARG VITE_OIDC_EMAIL_CHANGE_URI
ARG VITE_OIDC_PASSWORD_CHANGE_URl
ARG VITE_TITLE
ARG VITE_ALLOWED_SPECIES
ARG SASS_VARIABLE_PRIMARY

RUN pnpm run build

FROM build-stage as api-deploy
# Remove circular dependency
# RUN pnpm -C packages/app remove @petboarding/api
RUN pnpm prune --prod
RUN pnpm --filter @petboarding/api deploy api --prod
RUN pnpm --filter @petboarding/app deploy app --prod --no-optional
RUN gzip -k -r /build/api/dist/server/*
RUN gzip -k -r /build/app/dist/ssr/client/*
RUN rm /build/app/dist/ssr/client/termsandconditions.pdf.gz
RUN rm /build/app/dist/ssr/client/privacypolicy.pdf.gz
RUN rm /build/app/dist/ssr/client/logo.svg.gz

FROM node:20-slim as api
LABEL "io.petboarding.vendor"="simsustech"
RUN apt-get update && apt-get install -y curl
WORKDIR /app
COPY --from=api-deploy /build/api /app
COPY --from=api-deploy /build/app /packages/app
ENV HOST=0.0.0.0
ENV PORT=80
EXPOSE 80
CMD ["npm", "start"]
