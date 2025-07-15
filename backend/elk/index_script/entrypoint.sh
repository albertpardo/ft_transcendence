#!/bin/bash

set -e

ELASTIC_URL="${ELASTIC_URL}"
USER="${ELASTIC_US}"
PASS="${ELASTIC_PASSWORD}"
KIBANA_URL="${KIBANA_URL}"

CA_CERT="/root/certs/ca/ca.crt"

# constanst
POLICY_NAME="logs_policy"
SNAPSHOT_REPOSITORY_NAME="my_backup"

# Definir el array con los patrones para usar como index patterns
patterns="gameservice usermanagement apigateway frontend"

# Fichero de dashboard al que hay que actualizar con los nuevos IDs generados al crear los indexpatterns
NDJSON_IN="/root/dashboard_example.ndjson" 
NDJSON_OUT="/root/dashboard_example_copy.ndjson" 

########## INDEX PATTERN #####
echo "============================"
echo "🔧 CREATING INDEX PATTERNS"
echo "============================"

declare -A new_ids

create_index_pattern() {
  index_pattern="$1"
  echo "🔍 Checking if index pattern '$index_pattern' exists..."

  # Buscar por title
  response=$(curl -s --cacert "$CA_CERT" \
    -u "$USER:$PASS" \
    -X GET "$KIBANA_URL/api/saved_objects/_find?type=index-pattern&search_fields=title&search=$index_pattern" \
    -H "kbn-xsrf: true")

  total=$(echo "$response" | grep -o '"total":[0-9]*' | cut -d: -f2)

  if [ "$total" -ge 1 ]; then
    echo "  ✅ Index pattern '$index_pattern' already exists. Skipping."
    return
  fi

  echo "  ➕ Creating index pattern '$index_pattern'..."

  create_response=$(curl -s -w "%{http_code}" --cacert "$CA_CERT" \
    -u "$USER:$PASS" \
    -X POST "$KIBANA_URL/api/saved_objects/index-pattern" \
    -H "kbn-xsrf: true" \
    -H "Content-Type: application/json" \
    -d '{
      "attributes": {
        "title": "'"$index_pattern"-*'",
        "timeFieldName": "@timestamp"
      }
    }')

  http_code=$(echo "$create_response" | tail -c 4)
  body=$(echo "$create_response" | sed "s/$http_code$//")

  if [ "$http_code" -ne 200 ]; then
    echo "  ❌ Failed to create index pattern '$index_pattern'. HTTP code: $http_code"
    echo "Response body: $body"
    exit 1
  else
    echo "  ✅ Successfully created index pattern '$index_pattern'."
	new_ids["$index_pattern"]=$(echo "$body" | jq -r '.id')
	echo "  - ID asignado= ${new_ids[$index_pattern]}"
  fi
}

# Iterar sobre los patrones
for pattern in $patterns; do
  create_index_pattern "${pattern}file" 
  create_index_pattern "${pattern}http" 
done

echo "🏁 Done: Index patterns created."

# Cambiar los ID's del fichero con los dashboards 

#echo "🔍 Import Dashboard example to Kibana..."
#
#cp "$NDJSON_IN" "$NDJSON_OUT"
#old_id=""
#for pattern in $patterns; do
#  new_id=${new_ids["$pattern"]}
#  old_id=$(grep "\"title\":\"$pattern\"" $NDJSON_IN | grep '"id"' | head -n1 | jq -r '.id')
#  sed -i "s/$old_id/$new_id/g" "$NDJSON_OUT"
#done
#
## Importar a Kibana el archivo actualizado
#response=$(curl -s -w "%{http_code}" -X POST "$KIBANA_URL/api/saved_objects/_import?overwrite=true" \
#  -u "$USER:$PASS" \
#  --cacert "$CA_CERT" \
#  -H "kbn-xsrf: true" \
#  -F file=@$NDJSON_OUT)
#
#http_code=$(echo "$response" | tail -c 4)
#body=$(echo "$response" | sed "s/$http_code$//")
#
#if [ "$http_code" -ne 200 ]; then
#  echo " - ❌ Error importing dashboards (HTTP $http_code). EXIT."
#  echo "Response body: $body"
#  exit 1
#else
#  echo " - ✅ Dashboard Imported."
#fi

###### ILM POLICY ###########
echo
echo "============================"
echo "🔧 CREATING $POLICY_NAME"
echo "============================"

echo "🔍 ILM :$POLICY_NAME..."

response=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$ELASTIC_URL/_ilm/policy/$POLICY_NAME" \
  --cacert "$CA_CERT" \
  -H "Content-Type: application/json" \
  -u $USER:$PASS -d '
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_age": "30s",
			"max_size": "50kb",
			"max_primary_shard_docs": 25
          }
        }
      },
      "delete": {
        "min_age": "2m",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}')

if [ "$response" -ne 200 ] && [ "$response" -ne 201 ]; then
  echo " - ❌ Error ILM policy (HTTP $response). EXIT."
  exit 1
fi

echo " - ✅ ILM policy OK!."

###### TEMPLATES  ###########
echo
echo "============================"
echo "🔧 CREATING TEMPLATES"
echo "============================"

create_template () {
  alias=$1

  echo "🔍 Apply ${alias}_template..."

  response=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$ELASTIC_URL/_index_template/${alias}_template" \
    --cacert "$CA_CERT" \
    -H "Content-Type: application/json" \
    -u $USER:$PASS \
    -d @- <<EOF
{
  "index_patterns": ["${alias}-*"],
  "template": {
    "settings": {
      "index": {
        "lifecycle": {
          "name": "logs_policy",
          "rollover_alias": "${alias}"
        },
        "number_of_shards": 1,
        "number_of_replicas": 0
      }
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "message": { "type": "text" },
        "source": { "type": "keyword" }
      }
    }
  }
}
EOF
)

  if [ "$response" -ne 200 ] && [ "$response" -ne 201 ]; then
    echo " - ❌ Error pongfile_template (HTTP $response). Exit"
    exit 1
  fi

  echo " -✅ ${alias}_template OK!."
}

# Iterar sobre los patrones
for pattern in $patterns; do
  create_template "${pattern}file" 
  create_template "${pattern}http"
done

echo "🏁 Done: Templates created."


######  Create INDEXES ended with 000001
echo "============================"
echo "🔧 CREATING INDEX TEMPLATES"
echo "============================"

create_initial_index () {
  alias=$1
  index_name="${alias}-000001"

  echo "🔍 Check if '${alias}' index exists..."

  alias_response=$(curl -s --cacert "$CA_CERT" -u "$USER:$PASS" \
    -X GET "$ELASTIC_URL/_alias/${alias}")

  if echo "$alias_response" | grep -q 'is_write_index' ; then
    echo " - ✅ '${alias}' index exists. It's not necessary to create ${index_name}."
  else
    echo " - 🔍 Creating initial index '${index_name}'..."

    response=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$ELASTIC_URL/${index_name}" \
      --cacert "$CA_CERT" \
      -H "Content-Type: application/json" \
      -u $USER:$PASS \
      -d @- <<EOF
{
  "aliases": {
    "${alias}": {
      "is_write_index": true
    }
  }
}
EOF
)

    if [ "$response" -ne 200 ] && [ "$response" -ne 201 ]; then
      echo " - ❌ Error creating ${index_name} (HTTP $response). EXIT."
      exit 1
    fi

    echo " - ✅ ${index_name} index created successfully."
  fi
}

# Iterar sobre los patrones
for pattern in $patterns; do
  create_initial_index "${pattern}file"
  create_initial_index "${pattern}http"
done

echo "🏁 Done: Indexes ended with 000001 created."

:
########## snapshot ##########
echo
echo "============================"
echo "🔧 CONFIGURE SNAPSHOST"
echo "============================"
echo
echo "🔍 Start snapshot repository 'my_backup'..."

response=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$ELASTIC_URL/_snapshot/my_backup" \
  --cacert "$CA_CERT" \
  -H "Content-Type: application/json" \
  -u $USER:$PASS -d '
{
  "type": "fs",
  "settings": {
    "location": "/mnt/snapshots",
    "compress": true
  }
}')

if [ "$response" -ne 200 ] && [ "$response" -ne 201 ]; then
  echo " - ❌ Error in snapshot repository (HTTP $response). EXIT."
  exit 1
fi

echo " - ✅ Snapshot repository 'my_backup' OK!."

# Crear política 

echo "🔍 Setup snapshot policy: 'mi-politica-snapshot'..."

create_response=$(curl -s -w "\n%{http_code}" -X PUT "$ELASTIC_URL/_slm/policy/mi-politica-snapshot" \
  --cacert "$CA_CERT" \
  -H "Content-Type: application/json" \
  -u $USER:$PASS -d '
{
  "schedule": "0 0/15 * * * ?",
  "name": "<snapshot-{now}>",
  "repository": "my_backup",
  "config": {
    "indices": ["*"],
    "ignore_unavailable": false,
    "include_global_state": true
  },
  "retention": {
    "expire_after": "7d",
    "min_count": 1,
    "max_count": 3
  }
}')

body=$(echo "$create_response" | sed '$d')
http_code=$(echo "$create_response" | tail -n1)

if [ "$http_code" -ne 200 ] && [ "$http_code" -ne 201 ]; then
  echo " - ❌ Error snapshot policy (HTTP $http_code)."
  echo "Body: $body"
  exit 1
fi

echo " - ✅ snapshot policy 'mi-politica-snapshot' OK!."

# EXECUTE mi-politica-snapshot 
echo
echo "🔍 Start snapshot policy : 'mi-politica-snapshot'..."

execute_response=$(curl -s -w "\n%{http_code}" -X POST "$ELASTIC_URL/_slm/policy/mi-politica-snapshot/_execute" \
  --cacert "$CA_CERT" \
  -H "Content-Type: application/json" \
  -u $USER:$PASS)

body=$(echo "$execute_response" | sed '$d')
http_code=$(echo "$execute_response" | tail -n1)

if [ "$http_code" -ne 200 ]; then
  echo " - ❌ Error to start snapshot policy (HTTP $http_code)."
  echo "Body: $body"
  exit 1
fi

echo " - ✅ Snapshot policy started."

echo "=================================================================="
echo "🏁 DONE : ILM + templates + aliases para fastify, logs, Snapshot."
echo "=================================================================="

