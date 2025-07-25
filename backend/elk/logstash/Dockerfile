FROM docker.elastic.co/logstash/logstash:9.0.1

USER root

COPY ./logstash/logstash.yml /usr/share/logstash/config/logstash.yml
COPY ./logstash/logstash.conf /usr/share/logstash/pipeline/logstash.conf
COPY ./certs /usr/share/logstash/config/certs

RUN chown -R logstash:logstash /usr/share/logstash/config/certs

USER logstash
