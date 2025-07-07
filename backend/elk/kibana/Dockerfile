FROM docker.elastic.co/kibana/kibana:9.0.1

COPY ./certs /usr/share/kibana/config/certs
COPY ./kibana/config /usr/share/kibana/config

RUN bin/kibana-keystore create 
