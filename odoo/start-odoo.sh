#!/bin/bash
set -e

echo "start-odoo.sh is started."

export LANG="ja_JP.UTF-8"
export LANGUAGE="ja_JP:ja"
export LC_ALL="ja_JP.UTF-8"

db_name=${DB_NAME}
db_user=${DB_USER}
db_password=${DB_PASSWORD}

timeout_seconds=60

# PostgreSQLが起動するまで待機 (タイムアウト追加)
timeout "$timeout_seconds" bash -c '
    while true; do
        pg_isready -h db -p 5432
        if [ $? -eq 0 ]; then
            break
        fi
        sleep 1
    done
' || { echo "Error: PostgreSQL not ready after $timeout_seconds seconds." >&2; exit 1; }

# モジュールリストの読み込み
init_load_addons=$(cat /path/to/init_load_addons.txt | tr '\n' ',' | sed 's/,$//')

# Odooの起動
odoo_output=$(python3 /usr/bin/odoo \
    -i "$init_load_addons" \
    --database "$db_name" \
    --db_host db \
    --db_port "5432" \
    --db_user "$db_user" \
    --db_password "$db_password" \
    --dev=reload \
    2>&1) || { echo "Error starting Odoo: $odoo_output" >&2; exit 1; }

echo "$odoo_output" # Odooの出力をログに表示

echo "start-odoo.sh finished."