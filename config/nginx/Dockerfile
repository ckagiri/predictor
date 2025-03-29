FROM nginx

EXPOSE 8100

COPY ./config/nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --chmod=755 ./config/nginx/wait-for-client /wait-for-client