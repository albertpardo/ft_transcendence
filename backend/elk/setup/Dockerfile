FROM alpine:3.20.6

RUN apk add curl

COPY ./setup/setup_es_certs.sh /root/setup_es_certs.sh
COPY ./certs /root/certs

RUN chmod +x /root/setup_es_certs.sh

CMD ["./root/setup_es_certs.sh"]
