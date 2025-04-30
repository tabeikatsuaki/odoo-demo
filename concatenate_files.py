import os

def concatenate_files_split(source_dir, output_prefix, max_file_size):
    """
    指定されたディレクトリ以下の.py, .xml, .js, .tsファイルの内容を、
    パス情報を付加して拡張子ごとに複数のファイルに分割して連結する。

    Args:
        source_dir (str): 処理対象のディレクトリのパス。
        output_prefix (str): 出力ファイルのプレフィックス（例: "default_addons_sourcecode_")。
        max_file_size (int): 1ファイルあたりの最大サイズ（MB）。
    """

    file_counts = {ext: 0 for ext in ['.py', '.xml', '.js', '.ts']}
    current_files = {ext: None for ext in ['.py', '.xml', '.js', '.ts']}
    current_file_sizes = {ext: 0 for ext in ['.py', '.xml', '.js', '.ts']}

    def open_new_file(ext):
        """新しい出力ファイルを開く"""
        nonlocal file_counts, current_files, current_file_sizes
        if current_files[ext]:
            current_files[ext].close()
        output_file = f"{output_prefix}{ext[1:]}{file_counts[ext]:02d}.txt"
        current_files[ext] = open(output_file, 'w', encoding='utf-8', errors='ignore')
        current_file_sizes[ext] = 0
        file_counts[ext] += 1

    def write_to_file(ext, content):
        """現在のファイルに内容を書き込む"""
        nonlocal current_file_sizes
        current_files[ext].write(content)
        current_file_sizes[ext] += len(content.encode('utf-8'))

    # 最初のファイルを開く
    for ext in ['.py', '.xml', '.js', '.ts']:
        open_new_file(ext)

    def process_directory(directory):
        nonlocal current_files, current_file_sizes

        for item in os.listdir(directory):
            item_path = os.path.join(directory, item)

            if os.path.isfile(item_path):
                _, ext = os.path.splitext(item)
                if ext in ['.py', '.xml', '.js', '.ts']:
                    relative_path = os.path.relpath(item_path, source_dir)
                    header = f"--- {relative_path} ---\n"

                    with open(item_path, 'r', encoding='utf-8', errors='ignore') as infile:
                        content = infile.read()
                    full_content = header + content + "\n\n"

                    # ファイルサイズチェック
                    content_size = len(full_content.encode('utf-8'))
                    if current_file_sizes[ext] + content_size > max_file_size * 1024 * 1024:
                        open_new_file(ext)  # 新しいファイルを開く

                    write_to_file(ext, full_content)

            elif os.path.isdir(item_path):
                process_directory(item_path)

    process_directory(source_dir)

    for ext in ['.py', '.xml', '.js', '.ts']:
        if current_files[ext]:
            current_files[ext].close()

if __name__ == "__main__":
    source_directory = "odoo/default_addons"
    output_prefix = "default_addons_sourcecode_"
    max_file_size_mb = 10  # MB単位

    concatenate_files_split(source_directory, output_prefix, max_file_size_mb)
    print("Files concatenated and split by extension.")


# import os

# def concatenate_files_split(source_dir, output_prefix, max_file_size):
#     """
#     指定されたディレクトリ以下の.py, .xml, .js, .tsファイルの内容を、
#     パス情報を付加して複数のファイルに分割して連結する。

#     Args:
#         source_dir (str): 処理対象のディレクトリのパス。
#         output_prefix (str): 出力ファイルのプレフィックス（例: "default_addons_sourcecode_")。
#         max_file_size (int): 1ファイルあたりの最大サイズ（MB）。
#     """

#     file_count = 0
#     current_file = None
#     current_file_size = 0

#     def open_new_file():
#         """新しい出力ファイルを開く"""
#         nonlocal file_count, current_file, current_file_size
#         if current_file:
#             current_file.close()
#         output_file = f"{output_prefix}{file_count:02d}.txt"
#         current_file = open(output_file, 'w', encoding='utf-8', errors='ignore')
#         current_file_size = 0
#         file_count += 1

#     def write_to_file(content):
#         """現在のファイルに内容を書き込む"""
#         nonlocal current_file_size
#         current_file.write(content)
#         current_file_size += len(content.encode('utf-8'))

#     # 最初のファイルを開く
#     open_new_file()

#     def process_directory(directory):
#         nonlocal current_file, current_file_size

#         for item in os.listdir(directory):
#             item_path = os.path.join(directory, item)

#             if os.path.isfile(item_path):
#                 _, ext = os.path.splitext(item)
#                 if ext in ['.py', '.xml', '.js', '.ts']:
#                     relative_path = os.path.relpath(item_path, source_dir)
#                     header = f"--- {relative_path} ---\n"

#                     with open(item_path, 'r', encoding='utf-8', errors='ignore') as infile:
#                         content = infile.read()
#                     full_content = header + content + "\n\n"

#                     # ファイルサイズチェック
#                     content_size = len(full_content.encode('utf-8'))
#                     if current_file_size + content_size > max_file_size * 1024 * 1024:
#                         open_new_file()  # 新しいファイルを開く

#                     write_to_file(full_content)

#             elif os.path.isdir(item_path):
#                 process_directory(item_path)

#     process_directory(source_dir)

#     if current_file:
#         current_file.close()

# if __name__ == "__main__":
#     source_directory = "odoo/default_addons"
#     output_prefix = "default_addons_sourcecode_"
#     max_file_size_mb = 10  # MB単位

#     concatenate_files_split(source_directory, output_prefix, max_file_size_mb)
#     print("Files concatenated and split.")