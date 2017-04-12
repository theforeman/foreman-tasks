SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

RAILS_ENV=production
FOREMAN_HOME=/usr/share/foreman

# Clean up the session entries in the database
45 19 * * *     foreman    /usr/sbin/foreman-rake foreman_tasks:cleanup >>/var/log/foreman/cron.log 2>&1
