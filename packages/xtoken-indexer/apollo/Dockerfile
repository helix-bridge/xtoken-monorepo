FROM node:24.22.1-bookworm

COPY . /app

RUN cd /app && \
  yarn install && \
  npx prisma generate

WORKDIR /app

EXPOSE 4002

ENV VERSION_MODE prod

ENTRYPOINT /app/scripts/entrypoint.sh ${VERSION_MODE}
