FROM alpine:3.20.6

RUN apk add --no-cache curl jq bash

COPY ./certs /root/certs
COPY ./index_script/entrypoint.sh /root/entrypoint.sh
COPY ./index_script/dashboard_example.ndjson /root/dashboard_example.ndjson

RUN chmod +x /root/entrypoint.sh
    
CMD ["./root/entrypoint.sh"]
