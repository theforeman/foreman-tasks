#!/bin/bash

# This file provides additional debug information for foreman-debug tool and is
# symlinked as /usr/share/foreman/script/foreman-debug.d/60-dynflow_debug

GET_DB_CONFIG_SCRIPT='db = YAML.load_file("/etc/foreman/database.yml")["production"];puts %(PGPASSWORD="#{db["password"]}" psql -U #{db["username"]} -h "#{db["host"]||"localhost"}" -p #{db["port"]||"5432"} -d #{db["database"]})'
FOREMAN_PSQL_COMMAND=`ruby -ryaml -e "$GET_DB_CONFIG_SCRIPT"`

export_csv() {
  echo "COPY ($1) TO STDOUT WITH CSV;" | eval $FOREMAN_PSQL_COMMAND > $2
}

add_files /var/log/foreman/dynflow_executor*.log*
add_files /var/log/foreman/dynflow_executor*.output*

# Foreman Tasks fast export (for HTML version use foreman-rake foreman_tasks:export_tasks)
export_csv "select dynflow_execution_plans.* from foreman_tasks_tasks join dynflow_execution_plans on (foreman_tasks_tasks.external_id = dynflow_execution_plans.uuid) where foreman_tasks_tasks.started_at > 'now'::timestamp - '${DYNFLOW_EXPORT_MONTHS:-6} months'::interval" "$DIR/dynflow_execution_plans.csv"
export_csv "select dynflow_actions.* from foreman_tasks_tasks join dynflow_actions on (foreman_tasks_tasks.external_id = dynflow_actions.execution_plan_uuid) where foreman_tasks_tasks.started_at > 'now'::timestamp - '${DYNFLOW_EXPORT_MONTHS:-6} months'::interval" "$DIR/dynflow_actions.csv"
export_csv "select dynflow_steps.* from foreman_tasks_tasks join dynflow_steps on (foreman_tasks_tasks.external_id = dynflow_steps.execution_plan_uuid) where foreman_tasks_tasks.started_at > 'now'::timestamp - '${DYNFLOW_EXPORT_MONTHS:-6} months'::interval" "$DIR/dynflow_steps.csv"
export_csv "select * from dynflow_schema_info" "$DIR/dynflow_schema_info.csv"
export_csv "select * from foreman_tasks_tasks" "$DIR/foreman_tasks_tasks.csv"

