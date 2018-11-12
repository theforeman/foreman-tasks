#!/bin/bash

# This file provides additional debug information for foreman-debug tool and is
# symlinked as /usr/share/foreman/script/foreman-debug.d/60-dynflow_debug

FOREMAN_PSQL_COMMAND=$(ruby -ryaml <<-END
  db = YAML.load_file('/etc/foreman/database.yml')['production']
  puts [
    "PGPASSWORD='#{db['password']}'",
    'psql',
    '-U', "'#{db.fetch('username')}'",
    '-h', "'#{db['host'] || 'localhost'}'",
    '-p', "'#{(db['port'] || 5432).to_s}'",
    '-d', "'#{db.fetch('database')}'"
  ].join(' ')
END
)

FOREMAN_DB_ADAPTER=$(ruby -ryaml <<-END
  puts YAML.load_file('/etc/foreman/database.yml')['production']['adapter']
END
)

export_csv() {
  echo "COPY ($1) TO STDOUT WITH CSV;" | eval $FOREMAN_PSQL_COMMAND > $2
}

add_files /var/log/foreman/dynflow_executor*.log*
add_files /var/log/foreman/dynflow_executor*.output*

# Foreman Tasks fast export (Postgresql only; for HTML version use foreman-rake foreman_tasks:export_tasks)

if [ "$FOREMAN_DB_ADAPTER" == "postgresql" ]; then
    export_csv "select dynflow_execution_plans.* from foreman_tasks_tasks join dynflow_execution_plans on (foreman_tasks_tasks.external_id = dynflow_execution_plans.uuid) where foreman_tasks_tasks.started_at > 'now'::timestamp - '${DYNFLOW_EXPORT_MONTHS:-1} months'::interval limit ${DYNFLOW_EXPORT_LIMIT:-100000}" "$DIR/dynflow_execution_plans.csv"
    export_csv "select dynflow_actions.* from foreman_tasks_tasks join dynflow_actions on (foreman_tasks_tasks.external_id = dynflow_actions.execution_plan_uuid) where foreman_tasks_tasks.started_at > 'now'::timestamp - '${DYNFLOW_EXPORT_MONTHS:-1} months'::interval limit ${DYNFLOW_EXPORT_LIMIT:-100000}" "$DIR/dynflow_actions.csv"
    export_csv "select dynflow_steps.* from foreman_tasks_tasks join dynflow_steps on (foreman_tasks_tasks.external_id = dynflow_steps.execution_plan_uuid) where foreman_tasks_tasks.started_at > 'now'::timestamp - '${DYNFLOW_EXPORT_MONTHS:-1} months'::interval limit ${DYNFLOW_EXPORT_LIMIT:-100000}" "$DIR/dynflow_steps.csv"
    export_csv "select * from dynflow_schema_info" "$DIR/dynflow_schema_info.csv"
    export_csv "select * from foreman_tasks_tasks limit ${DYNFLOW_EXPORT_LIMIT:-100000}" "$DIR/foreman_tasks_tasks.csv"
fi

