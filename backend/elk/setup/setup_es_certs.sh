#!/bin/sh

CA_CERT="/root/certs/ca/ca.crt"

if [ x${ELASTIC_PASSWORD} == x ] || [ x${KIBANA_PASSWORD} == x ]; then
    echo "Set the ELASTIC_PASSWORD and KIBANA_PASSWORD environment variables in the .env file";
    exit 1;
fi;

echo "Waiting for Elasticsearch availability";
until curl -s --cacert "$CA_CERT" "${ELASTIC_URL}" | grep -q "missing authentication credentials"; do sleep 30; done;
echo "Setting kibana_system password";
until curl -s -X POST --cacert "$CA_CERT" -u "${ELASTIC_US}:${ELASTIC_PASSWORD}" -H "Content-Type: application/json" "${ELASTIC_URL}"/_security/user/kibana_system/_password -d "{\"password\":\"${KIBANA_PASSWORD}\"}" | grep -q "^{}"; do sleep 10; done;
echo "All done!";
