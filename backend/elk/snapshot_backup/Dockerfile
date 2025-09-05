FROM alpine:3.20.6

RUN apk add --no-cache busybox coreutils findutils

COPY ./scripts/backup_snapshots.sh /root/backup_snapshots.sh

RUN chmod +x /root/backup_snapshots.sh

# Agrega tu crontab
RUN echo "*/2 * * * * /root/backup_snapshots.sh >> /var/log/cron.log 2>&1" >> /etc/crontabs/root
    
# Inicia cron en primer plano
CMD ["crond", "-f"]
