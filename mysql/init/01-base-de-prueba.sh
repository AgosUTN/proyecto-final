#!/bin/sh
# Crea la base de prueba del backend (<MYSQL_DATABASE>_test) y le da permisos al usuario de la aplicación.
# MySQL ejecuta este script solo al crear el volumen de datos por primera vez.
mysql -uroot -p"$MYSQL_ROOT_PASSWORD" <<SQL
CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}_test\`;
GRANT ALL PRIVILEGES ON \`${MYSQL_DATABASE}_test\`.* TO '${MYSQL_USER}'@'%';
SQL
