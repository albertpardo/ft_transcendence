#!/bin/bash

set -e

ELASTIC_URL="${ELASTIC_URL}"
USER="${ELASTIC_US}"
PASS="${ELASTIC_PASSWORD}"
KIBANA_URL="${KIBANA_URL}"

CA_CERT="/root/certs/ca/ca.crt"

echo "*****  SHELL : $SHELL"

########## INDEX PATTERN #####

# Definir el array con los patrones para usar como index patterns
patterns="pongfile ponghttp"
declare -A new_ids

# Fichero de dashboard al que hay que actualizar con los nuevos IDs generados al crear los indexpatterns
NDJSON_IN="/root/dashboard_example.ndjson" 
NDJSON_OUT="/root/dashboard_example_copy.ndjson" 

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
        "title": "'"$index_pattern"'",
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
  create_index_pattern "$pattern" 
done

echo "🏁 Done: Index patterns created."

# Cambiar los ID's del fichero con los dashboards 

echo "🔍 Import Dashboard example to Kibana..."

cp "$NDJSON_IN" "$NDJSON_OUT"
old_id=""
for pattern in $patterns; do
  new_id=${new_ids["$pattern"]}
  old_id=$(grep "\"title\":\"$pattern\"" $NDJSON_IN | grep '"id"' | head -n1 | jq -r '.id')
  sed -i "s/$old_id/$new_id/g" "$NDJSON_OUT"
done

# Importar a Kibana el archivo actualizado
response=$(curl -s -w "%{http_code}" -X POST "$KIBANA_URL/api/saved_objects/_import?overwrite=true" \
  -u "$USER:$PASS" \
  --cacert "$CA_CERT" \
  -H "kbn-xsrf: true" \
  -F file=@$NDJSON_OUT)

http_code=$(echo "$response" | tail -c 4)
body=$(echo "$response" | sed "s/$http_code$//")

if [ "$http_code" -ne 200 ]; then
  echo " - ❌ Error importing dashboards (HTTP $http_code). EXIT."
  echo "Response body: $body"
  exit 1
else
  echo " - ✅ Dashboard Imported."
fi

###### ILM POLICY ###########

########## FASTIFY ##########

echo "🔍 ILM :pongfile_policy..."

response=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$ELASTIC_URL/_ilm/policy/pongfile_policy" \
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
  echo " - ❌ Error pongfile_policy ILM (HTTP $response). EXIT."
  exit 1
fi

echo " - ✅ pongfile ILM policy OK!."

echo "🔍 Apply pongfile_template..."

response=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$ELASTIC_URL/_index_template/pongfile_template" \
  --cacert "$CA_CERT" \
  -H "Content-Type: application/json" \
  -u $USER:$PASS -d '
{
  "index_patterns": ["pongfile-*"],
  "template": {
    "settings": {
      "index": {
        "lifecycle": {
          "name": "pongfile_policy",
          "rollover_alias": "pongfile"
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
}')

if [ "$response" -ne 200 ] && [ "$response" -ne 201 ]; then
  echo " - ❌ Error pongfile_template (HTTP $response). Exit"
  exit 1
fi

echo " -✅ pongfile_template OK!."

echo "🔍 Check if 'pongfile' index exits..."

alias_response=$(curl -s --cacert "$CA_CERT" -u "$USER:$PASS" \
  -X GET "$ELASTIC_URL/_alias/pongfile")

if echo "$alias_response" | grep -q 'is_write_index' ; then
  echo " - ✅ 'pongfile' index exits. It's not necessary to create pongfile-000001."
else
  echo " - 🔍 Initial pongfile-000001 index it's being created..."

  response=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$ELASTIC_URL/pongfile-000001" \
    --cacert "$CA_CERT" \
    -H "Content-Type: application/json" \
    -u $USER:$PASS -d '
  {
    "aliases": {
      "pongfile": {
       "is_write_index": true
      }
    }
  }')

  if [ "$response" -ne 200 ] && [ "$response" -ne 201 ]; then
    echo " - ❌ Error pongfile-000001 index (HTTP $response). EXIT."
    exit 1
  fi

  echo " - ✅ pongfile-000001 index is OK!."
fi

########## LOGS ##########

echo "🔍 ILM : ponghttp_policy..."

response=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$ELASTIC_URL/_ilm/policy/ponghttp_policy" \
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
  echo " - ❌ Error ponghttp_policy ILM (HTTP $response). EXIT."
  exit 1
fi

echo " - ✅  ponghttp_policy ILM policy OK!"

echo "🔍 Apply ponghttp_template..."

response=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$ELASTIC_URL/_index_template/ponghttp_template" \
  --cacert "$CA_CERT" \
  -H "Content-Type: application/json" \
  -u $USER:$PASS -d '
{
  "index_patterns": ["ponghttp-*"],
  "template": {
    "settings": {
      "index": {
        "lifecycle": {
          "name": "ponghttp_policy",
          "rollover_alias": "ponghttp"
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
}')

if [ "$response" -ne 200 ] && [ "$response" -ne 201 ]; then
  echo " - ❌ Error ponghttp_template (HTTP $response). EXIT."
  exit 1
fi

echo " - ✅ ponghttp_template OK!."

echo "🔍 Check if 'ponghttp' index exits..."

alias_response=$(curl -s --cacert "$CA_CERT" -u "$USER:$PASS" \
  -X GET "$ELASTIC_URL/_alias/ponghttp")

if echo "$alias_response" | grep -q 'is_write_index' ; then
  echo " - ✅ 'ponghttp' index exist. It's not necessary to create ponghttp-000001."
else

  echo " - 🔍 Intial ponghttp-000001 index it's being created..."

  response=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$ELASTIC_URL/ponghttp-000001" \
    --cacert "$CA_CERT" \
    -H "Content-Type: application/json" \
    -u $USER:$PASS -d '
  {
    "aliases": {
      "ponghttp": {
        "is_write_index": true
      }
    }
  }')

  if [ "$response" -ne 200 ] && [ "$response" -ne 201 ]; then
    echo " - ❌ Error  ponghttp-000001 index (HTTP $response). EXIT."
    exit 1
  fi

  echo " - ✅ Índice ponghttp-000001 index is OK!."
fi

########## snapshot ##########

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
echo "🏁 DONE : ILM + templates + aliases para fastify, logs, Snapshot."

