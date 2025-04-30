#!/bin/bash

# .envファイルから変数を読み込む
if [ -f ".env" ]; then
  while IFS='=' read -r key value; do
    if [[ "$key" =~ ^# || -z "$key" ]]; then
      continue
    fi
    export "$key=$value"
  done < ".env"
fi

# Odooのバージョンが定義されているかチェック
if [ -z "$ODOO_VERSION" ]; then
  echo "Error: ODOO_VERSION is not defined in .env"
  exit 1
fi

odoo_version="$ODOO_VERSION"

# ダウンロードディレクトリとvenvディレクトリを設定
downloads_dir="downloads"
venv_dir=".venv"

# 最新のOdooディレクトリを特定
odoo_dirs=($(find "$downloads_dir" -maxdepth 1 -type d -name "odoo-$odoo_version.*"))
if [ ${#odoo_dirs[@]} -eq 0 ]; then
  echo "エラー: Odooディレクトリが見つかりません。"
  exit 1
fi

latest_odoo_dir=$(echo "${odoo_dirs[@]}" | tr ' ' '\n' | sort -V | tail -n 1) # 必要に応じて詳細なバージョン比較を実装してください。
latest_odoo_path="$latest_odoo_dir"

# requirements.txtファイルのパスを設定
requirements_file="$latest_odoo_path/requirements.txt"

# 既存の仮想環境を削除
rm -rf "$venv_dir"

# 仮想環境の作成
echo "仮想環境を作成中..."
python3 -m venv "$venv_dir"

# 仮想環境のアクティベート
echo "仮想環境をアクティベート中..."
activate_script="$venv_dir/bin/activate"

# 依存関係のインストール
echo "依存関係のインストール中..."
"$venv_dir/bin/pip" install -r "$requirements_file"

# Sphinxとautodocをインストール
echo "Sphinxとautodocをインストール中..."
"$venv_dir/bin/pip" install sphinx

# Odooディレクトリのパスを指定
odoo_dir="$latest_odoo_path/odoo"

# 仮想環境内のOdooディレクトリのパスを指定
venv_odoo_dir="$venv_dir/lib/$(ls -d "$venv_dir/lib/"*/)/site-packages/odoo"
# ディレクトリが存在しない場合は作成
mkdir -p "$venv_odoo_dir"

# Odoo本体からコピーするファイルとディレクトリのリスト
files=(
  "api.py"
  "exceptions.py"
  "fields.py"
  "http.py"
  "loglevels.py"
  "models.py"
  "netsvc.py"
  "release.py"
  "sql_db.py"
  "tools"
)

# ファイルをコピー
for file in "${files[@]}"; do
  source_path="$odoo_dir/$file"
  dest_path="$venv_odoo_dir/$file"

  # ファイルまたはディレクトリが存在するか確認
  if [ -e "$source_path" ]; then
    if [ -f "$source_path" ]; then
      cp "$source_path" "$dest_path"
      echo "コピー: $file"
    elif [ -d "$source_path" ]; then
      cp -r "$source_path" "$dest_path"
      echo "コピー: $file"
    else
      echo "不明なファイルタイプ: $file"
    fi
  else
    echo "ファイルまたはディレクトリが見つかりません: $file ($source_path)"
  fi
done

echo "完了！"
echo "仮想環境は '$venv_dir' に作成されました。"
echo "仮想環境をアクティベートするには、次のコマンドを実行してください："
echo "source $venv_dir/bin/activate"
echo "アクティベートを無効化するには、次のコマンドを実行してください："
echo "deactivate"