# PostgreSQLが起動するまで待機 (タイムアウト追加)
timeout 60 bash -c '
    while true; do
        pg_isready -h db -p 5432
        if [ $? -eq 0 ]; then
            break
        fi
        sleep 1
    done
' || { echo "Error: PostgreSQL not ready after 60 seconds." >&2; exit 1; }
