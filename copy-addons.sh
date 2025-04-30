#!/bin/bash

# .envファイルから変数を読み込む
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Odooのバージョンが定義されているかチェック
if [ -z "$ODOO_VERSION" ]; then
  echo "Error: ODOO_VERSION is not defined in .env"
  exit 1
fi

# downloadsディレクトリを基準とした相対パスを調整
DOWNLOADS_DIR="downloads" # downloadsディレクトリの場所を定義
ODOO_TAR_FILE="${DOWNLOADS_DIR}/odoo_${ODOO_VERSION}.latest.tar.gz" # tar.gzファイルの場所を定義
DEFAULT_ADDONS_DIR="./odoo/default_addons" # デフォルトディレクトリを定義

# downloadsディレクトリが存在するかチェック
if [ ! -d "$DOWNLOADS_DIR" ]; then
    echo "Error: Downloads directory not found: $DOWNLOADS_DIR"
    exit 1
fi

# downloadsディレクトリ内のtar.gzファイル以外のフォルダやファイルを削除
find "$DOWNLOADS_DIR" -maxdepth 1 -type f ! -iname "*.tar.gz" -exec rm -f {} \;

# 圧縮ファイルが存在するかチェック
if [ ! -f "$ODOO_TAR_FILE" ]; then
    echo "Error: Compression file not found: $ODOO_TAR_FILE"
    exit 1
fi

# Odoo18の最新ソースを解凍
tar xzfv "$ODOO_TAR_FILE" -C "$DOWNLOADS_DIR"

# "odoo-${ODOO_VERSION}." から始まるディレクトリを一覧表示し、日付部分（最後の8桁）でソート
latest_dir=$(find "$DOWNLOADS_DIR" -maxdepth 1 -type d -name "odoo-${ODOO_VERSION}.*" | sort -t '+' -k 2.4,2.7n -k 2.1,2.3n | tail -1)

# ディレクトリ名から先頭の "./downloads/" を削除
latest_dir=$(basename "$latest_dir")
latest_full_path="${DOWNLOADS_DIR}/${latest_dir}" #latest_dirのフルパスを作成

# 最新ディレクトリ内のすべてのファイルから書込権限を除去
find "$latest_full_path/odoo/addons" -type f -exec sh -c 'echo "Processing: {}"; chmod a-w "{}"' \;

# アドオンをコピー
rsync -av --delete --exclude='.git' "$latest_full_path/odoo/addons/" "$DEFAULT_ADDONS_DIR"