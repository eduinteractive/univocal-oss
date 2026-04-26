#!/usr/bin/env bash
set -euo pipefail

mkdir -p /run/httpd /var/run/shibboleth /var/log/shibboleth /etc/shibboleth/credentials
mkdir -p /var/www/html
# Plain HTTP path for k8s probes (avoids /Shibboleth.sso/Status + Host/SSL quirks in prod)
printf 'ok\n' > /var/www/html/shibboleth-k8s-probe

/usr/sbin/shibd -F &
exec /usr/sbin/httpd -DFOREGROUND