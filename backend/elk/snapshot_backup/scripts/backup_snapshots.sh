#!/bin/ash

# Carpetas dentro de /backup
LOGS_ELASTIC_DIR="/backup/logs_elastic"
BACKUP_ELASTIC_LOGS_DIR="/backup/logs_elastic_backup"

# Archivo para guardar el checksum del último snapshot
LAST_INDEX_FILE="$BACKUP_ELASTIC_LOGS_DIR/.last_index_checksum"

# Archivo asociado con a index.lastest del contenedor elastic
LOGS_INDEX_LAST_FILE="/backup/logs_elastic/index.latest"

# Salir si no existe index.latest (no hay snapshot aún)
if [ ! -f "$LOGS_INDEX_LAST_FILE" ]; then
    echo "[!] File not found: $LOGS_INDEX_LAST_FILE"
    exit 1
fi

# Calcular el checksum actual
CURRENT_CHECKSUM=$(md5sum "$LOGS_INDEX_LAST_FILE" | awk '{print $1}')

# Leer el checksum anterior
if [ -f "$LAST_INDEX_FILE" ]; then
    LAST_CHECKSUM=$(cat "$LAST_INDEX_FILE")
else
    LAST_CHECKSUM=""
fi

# Comparar: si cambió, hacer copia
if [ "$CURRENT_CHECKSUM" != "$LAST_CHECKSUM" ]; then
    TIMESTAMP=$(date "+%Y-%m-%d_%H-%M-%S")
    DEST="$BACKUP_ELASTIC_LOGS_DIR/backup_$TIMESTAMP"
    cp -r "$LOGS_ELASTIC_DIR" "$DEST"
    echo "$CURRENT_CHECKSUM" > "$LAST_INDEX_FILE"
    echo "[✔] Backup in en $DEST"
else
    echo "[·] No new snapshots. No copy done."
fi

# Limpiar: mantener solo los 5 backups más recientes
cd "$BACKUP_ELASTIC_LOGS_DIR"
ls -dt backup_* 2>/dev/null | tail -n +6 | xargs -r rm -rf

