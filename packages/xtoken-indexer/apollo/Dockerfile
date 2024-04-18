FROM node:14-alpine

COPY . /app

RUN cd /app && \
  yarn install && \
  npx prisma generate

WORKDIR /app

EXPOSE 4002

ENV VERSION_MODE prod

# CMD [ "node", "index.js" ]

ENTRYPOINT /app/apollo/scripts/entrypoint.sh ${VERSION_MODE}
