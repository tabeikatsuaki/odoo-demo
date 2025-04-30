up:
	docker compose up
upd:
	docker compose up -d
build:
	docker compose build --no-cache --force-rm
stop:
	docker compose stop
down:
	docker compose down --remove-orphans
down-v:
	docker compose down --remove-orphans --volumes
restart:
	@make down
	@make upd
destroy:
	docker compose down --rmi all --volumes --remove-orphans
db-volume-rm:
	docker volume rm marutto-odoo-demo_db-data
prune:
	docker builder prune
prune-all:
	docker builder prune -f
	docker container prune -f
	docker image prune -f
	docker volume prune -f
ps:
	docker compose ps
openssl:
	openssl rand -base64 32
logs:
	docker compose logs
logs-watch:
	docker compose logs --follow
log-web:
	docker compose logs web
log-web-watch:
	docker compose logs --follow web
log-db:
	docker compose logs db
log-db-watch:
	docker compose logs --follow db

web-bash:
	docker compose exec web bash
# pytest-%:
# 	docker compose exec web pytest ${@:pytest-%=%}

# backend-bash:
# 	docker compose exec backend bash
# pip-ig:
# 	docker compose exec backend pip install -U pip
# pip-install:
# 	docker compose exec backend pip install -r requirements.txt
# pip-install-%:
# 	docker compose exec backend pip install ${@:pip-install-%=%}
# pip-uninstall-%:
# 	docker compose exec backend pip uninstall ${@:pip-uninstall-%=%}
# pytest:
# 	docker compose exec backend pytest -s tests/
# mypy:
# 	docker compose exec backend mypy .
# rm-migrations:
# 	rm -rf apps/backend/alembic/versions/*
# 	docker compose exec backend rm -rf alembic/versions/*
# init-migrations:
# 	docker compose exec backend pipenv run alembic revision --autogenerate -m "initial migration"
# upgrade-head:
# 	docker compose exec backend pipenv run alembic upgrade head
# seed:
# 	docker compose exec backend python3 alembic/seed.py
# init-db:
# 	mkdir -p apps/backend/alembic/versions
# 	@make db-reset
# 	@make rm-migrations
# 	@make init-migrations
# 	@make upgrade-head
# 	@make seed
# init-venv:
# 	sudo rm -rf venv
# 	python3.13 -m venv venv
# 	source venv/bin/activate

# frontend-bash:
# 	docker compose exec frontend bash
# npm-ig:
# 	docker compose exec frontend npm i -g npm
# npm-install:
# 	docker compose exec frontend npm install
# npm-update:
# 	cd apps/frontend && ncu -u
# 	@make npm-install
# # docker compose exec frontend npm-check-updates -u
# npm-dev:
# 	docker compose exec frontend npm run dev
# npm-build:
# 	docker compose exec frontend npm run build
# npm-build-watch:
# 	docker compose exec frontend npm run build:watch
# npm-preview:
# 	docker compose exec frontend npm run preview
# # npm-hot:
# # 	docker compose exec frontend npm run hot
# # npm-eslint:
# # 	docker compose exec frontend npm run eslint
# npm-lint:
# 	docker compose exec frontend npm run lint
# npm-lintfix:
# 	docker compose exec frontend npm run lint -- --fix
# # npm-format:
# # 	docker compose exec frontend npm run format
# npm-test:
# 	docker compose exec frontend npm run test
# npm-test-watch:
# 	docker compose exec frontend npm run test -- --watch
# # npm-check-updates:
# # 	docker compose exec frontend npx -p npm-check-updates -c "ncu"
# # npm-update:
# # 	docker compose exec frontend npx -p npm-check-updates -c "ncu -u"

db-bash:
	docker compose exec db bash

-include .env

createdb:
	docker compose exec db bash psql -h db -p 5432 -U "$(DB_USER)" -c "CREATE DATABASE $(DB_NAME) WITH OWNER = $(DB_USER) ENCODING='utf8';"
dropdb:
	docker compose exec db bash psql -h db -p 5432 -U "$(DB_USER)" -c "DROP DATABASE IF EXISTS $(DB_NAME);"
initdb:
	@make dropdb
	@make createdb

# # sql:
# # 	docker compose exec db bash -c 'mysql -u $$MYSQL_USER -p$$MYSQL_PASSWORD $$MYSQL_DATABASE'
# # redis:
# # 	docker compose exec redis redis-cli
# db-reset:
# 	@make down-v
# 	@make upd

# Odooの圧縮ファイルを解凍して標準モジュールを所定のディレクトリにコピー
cp-addons:
	python3 copy_addons.py
# 指定のカスタムモジュールのSphinxドキュメントソースファイルを生成
create-rst-files-%:
	python3 docs/create_rst_files.py ${@:create-rst-files-%=%}
# すべてのカスタムモジュールのSphinxドキュメントソースファイルを生成
create-rst-all-files:
	python3 docs/create_rst_files.py all

# venvをアクティベート
# （※「make venv-activate」を実行するとエラーになるため直接「source .venv/bin/activate」を実行してください）
# venv-activate:
# 	source .venv/bin/activate

# Sphinxのドキュメントを生成
# （※ venvをアクティベートしてから実行してください）
create-docs:
	cd docs && make html && cd ..

# カスタムモジュールのソースファイルをOdoo_hougetuよりコピー
cp-src-from-Odoo_hougetu:
	python3 copy_from_Odoo_hougetu.py
# # カスタムモジュールのソースファイルをOdoo_hougetuにコピー
# cp-src-to-Odoo_hougetu:
# 	python3 copy_to_Odoo_hougetu.py
# カスタムモジュールのSphinxドキュメントをOdoo_hougetuにコピー
cp-docs-to-Odoo_hougetu:
	rm -rf ~/biz/marutto/hougetu/Odoo_hougetu/docs
	cp -r docs ~/biz/marutto/hougetu/Odoo_hougetu

rebuild-playwright:
	docker compose build playwright --no-cache --force-rm
	docker compose up -d playwright
exec-playwright:
	docker cp ./playwright/tests odoo-demo-playwright:/playwright/tests
	docker compose exec playwright npx playwright test
	docker cp odoo-demo-playwright:/playwright/test-results ./playwright