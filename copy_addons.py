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
    # os.environ["ODOO_VERSION"] が 'yes' の場合は '+e' を付加
    if os.environ["ODOO_ENTERPRISE"] == "yes":
        odoo_version += "+e"

    # downloadsディレクトリを基準とした相対パスを調整
    downloads_dir = "downloads"  # downloadsディレクトリの場所を定義
    odoo_tar_file = os.path.join(downloads_dir, f"odoo_{odoo_version}.latest.tar.gz")  # tar.gzファイルの場所を定義
    default_addons_dir = "./odoo/default_addons"  # デフォルトディレクトリを定義

    # downloadsディレクトリが存在しない場合は新規作成
    if not os.path.isdir(downloads_dir):
        print(f"'downloads' directory not found. Creating: {downloads_dir}")
        os.makedirs(downloads_dir)

    # default_addonsディレクトリも存在しない場合は新規作成
    if not os.path.isdir(default_addons_dir):
        print(f"'default_addons' directory not found. Creating: {default_addons_dir}")
        os.makedirs(default_addons_dir)

    # downloadsディレクトリ内のtar.gzファイル以外のフォルダやファイルを削除
    for item in os.listdir(downloads_dir):
        item_path = os.path.join(downloads_dir, item)
        if os.path.isfile(item_path) and not item.endswith(".tar.gz"):
            os.remove(item_path)

    # 圧縮ファイルが存在するかチェック
    if not os.path.isfile(odoo_tar_file):
        print(f"Error: Compression file not found: {odoo_tar_file}")
        exit(1)

    # Odooの最新ソースを解凍
    try:
        subprocess.run(["tar", "xzfv", odoo_tar_file, "-C", downloads_dir], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error extracting tar file: {e}")
        exit(1)

    # "odoo-${ODOO_VERSION}." から始まるディレクトリを一覧表示し、日付部分（最後の8桁）でソート
    odoo_dirs = [d for d in os.listdir(downloads_dir) if d.startswith(f"odoo-{odoo_version}.")]
    if not odoo_dirs:
        print("Error: No Odoo directories found after extraction.")
        exit(1)

    # 簡易的なソート。必要に応じて詳細なバージョン比較を実装してください。
    latest_dir = sorted(odoo_dirs)[-1]
    latest_full_path = os.path.join(downloads_dir, latest_dir)  # latest_dirのフルパスを作成

    # 最新ディレクトリ内のすべてのファイルから書込権限を除去
    for root, _, files in os.walk(os.path.join(latest_full_path, "odoo", "addons")):
        for file in files:
            file_path = os.path.join(root, file)
            print(f"Processing: {file_path}")
            try:
                os.chmod(file_path, 0o644)  # a-w相当。読み取り専用にする
            except OSError as e:
                print(f"Error changing permissions for {file_path}: {e}")

    # アドオンをコピー
    try:
        subprocess.run(
            [
                "rsync",
                "-av",
                "--delete",
                "--exclude=.git",
                os.path.join(latest_full_path, "odoo", "addons/"),
                default_addons_dir,
            ],
            check=True,
        )
    except subprocess.CalledProcessError as e:
        print(f"Error copying addons: {e}")
        exit(1)

    print("完了！")

if __name__ == "__main__":
    main()