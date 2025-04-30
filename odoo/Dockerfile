ARG ODOO_VERSION
FROM odoo:${ODOO_VERSION:-17.0}

ARG DB_NAME
ARG DB_USER
ARG DB_PASSWORD

ENV DB_NAME=${DB_NAME}
ENV DB_USER=${DB_USER}
ENV DB_PASSWORD=${DB_PASSWORD}

COPY ./default_addons/ /mnt/default_addons/
COPY ./custom_addons/ /mnt/custom_addons/
COPY ./init_load_addons.txt /path/to/
COPY ./odoo.conf /etc/odoo/
COPY ./start-odoo.sh /path/to/

USER root

RUN apt update && \
    apt install -y --no-install-recommends \
    tzdata \
    locales && \
    locale-gen ja_JP.UTF-8

ENV TZ=Asia/Tokyo
ENV LANG=ja_JP.UTF-8
ENV LANGUAGE=ja_JP:ja
ENV LC_ALL=ja_JP.UTF-8

# 実行権限を付与
RUN chmod +x /path/to/start-odoo.sh

USER odoo

EXPOSE 8069

CMD ["bash", "/path/to/start-odoo.sh"]