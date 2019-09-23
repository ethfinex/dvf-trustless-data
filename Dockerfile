FROM node:12.10.0 as build
# ^-- using full node image for build, yarn install fails on alpine due
#     to missing deps.

WORKDIR /app

COPY yarn.lock yarn.lock
COPY package.json package.json
COPY src src

# https://yarnpkg.com/lang/en/docs/cli/install/#toc-yarn-install-frozen-lockfile
RUN yarn install --frozen-lockfile --production=true


# This will be the output image of `docker build` if --target in not specified.
FROM node:12.10.0-alpine
# ^-- using alpine to keep the image small

WORKDIR /app

COPY --from=build /app /
CMD yarn start
