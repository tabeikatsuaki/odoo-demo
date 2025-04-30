import os
import subprocess
import shutil

def main():
    # .envファイルから変数を読み込む
    if os.path.exists(".env"):
        with open(".env", "r") as f:
            for line in f:
                line = line.strip()
                if line.startswith("#") or not line:
                    continue
                key, value = line.split("=", 1)
                os.environ[key] = value

    # Odooのバージョンが定義されているかチェック
    if "ODOO_VERSION" not in os.environ:
        print("Error: ODOO_VERSION is not defined in .env")
        exit(1)

    odoo_version = os.environ["ODOO_VERSION"]

    # ダウンロードディレクトリとvenvディレクトリを設定
    downloads_dir = "downloads"
    venv_dir = ".venv"

    # 最新のOdooディレクトリを特定
    odoo_dirs = [d for d in os.listdir(downloads_dir) if d.startswith(f"odoo-{odoo_version}.")]
    if not odoo_dirs:
        print("エラー: Odooディレクトリが見つかりません。")
        exit(1)

    latest_odoo_dir = sorted(odoo_dirs)[-1] # 簡易的にsortして最後尾を取得。必要に応じて詳細なバージョン比較を実装してください。
    latest_odoo_path = os.path.join(downloads_dir, latest_odoo_dir)

    # requirements.txtファイルのパスを設定
    requirements_file = os.path.join(latest_odoo_path, "requirements.txt")

    # 既存の仮想環境を削除
    shutil.rmtree(venv_dir, ignore_errors=True)

    # 仮想環境の作成
    print("仮想環境を作成中...")
    subprocess.run(["python3", "-m", "venv", venv_dir], check=True)

    # 仮想環境のアクティベート
    print("仮想環境をアクティベート中...")
    activate_script = os.path.join(venv_dir, "bin", "activate")
    # Pythonでの仮想環境アクティベートは、subprocessでactivateスクリプトをsourceするのではなく、activateされた環境で後続のsubprocessを実行するような実装にします。
    # 依存関係のインストール
    print("依存関係のインストール中...")
    subprocess.run([os.path.join(venv_dir, "bin", "pip"), "install", "-r", requirements_file], check=True)

    # Sphinxとautodocをインストール
    print("Sphinxとautodocをインストール中...")
    subprocess.run([os.path.join(venv_dir, "bin", "pip"), "install", "sphinx"], check=True)

    # Odooディレクトリのパスを指定
    odoo_dir = os.path.join(latest_odoo_path, "odoo")

    # Odoo本体からコピーするファイルとディレクトリのリスト
    files = [
        "api.py",
        "exceptions.py",
        "fields.py",
        "http.py",
        "loglevels.py",
        "models.py",
        "netsvc.py",
        "release.py",
        "sql_db.py",
        "tools",
    ]

    # 仮想環境内のOdooディレクトリのパスを指定
    venv_odoo_dir = os.path.join(venv_dir, "lib", os.listdir(os.path.join(venv_dir, "lib"))[0], "site-packages", "odoo")
    # ディレクトリが存在しない場合は作成
    os.makedirs(venv_odoo_dir, exist_ok=True)

    # ファイルをコピー
    for file in files:
        source_path = os.path.join(odoo_dir, file)
        dest_path = os.path.join(venv_odoo_dir, file)

        # ファイルまたはディレクトリが存在するか確認
        if os.path.exists(source_path):
            if os.path.isfile(source_path):
                shutil.copy(source_path, dest_path)
                print(f"コピー: {file}")
            elif os.path.isdir(source_path):
                shutil.copytree(source_path, dest_path, dirs_exist_ok=True)
                print(f"コピー: {file}")
            else:
                print(f"不明なファイルタイプ: {file}")
        else:
            print(f"ファイルまたはディレクトリが見つかりません: {file} ({source_path})")

    print("完了！")
    print("仮想環境は '.venv' に作成されました。")
    print("仮想環境をアクティベートするには、次のコマンドを実行してください：")
    print("source .venv/bin/activate")
    print("アクティベートを無効化するには、次のコマンドを実行してください：")
    print("deactivate")

if __name__ == "__main__":
    main()