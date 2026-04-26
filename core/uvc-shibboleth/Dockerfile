FROM rockylinux:9

RUN dnf -y update && \
    dnf -y install ca-certificates dnf-plugins-core && \
    dnf -y swap curl-minimal curl && \
    curl -fsSL "https://shibboleth.net/cgi-bin/sp_repo.cgi?platform=rockylinux9" \
      -o /etc/yum.repos.d/shibboleth.repo && \
    dnf -y install httpd shibboleth && \
    dnf clean all && \
    rm -rf /var/cache/dnf

# Package ships /etc/httpd/conf.d/shib.conf (LoadModule + Location) — conflicts with our ConfigMap and breaks handlers.
RUN rm -f /etc/httpd/conf.d/shib.conf

RUN mkdir -p /run/httpd /var/run/shibboleth /var/log/shibboleth /etc/shibboleth/credentials

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]