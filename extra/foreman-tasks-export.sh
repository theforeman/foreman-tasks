#!/bin/bash

PROGNAME="$0"
EXECUTE=0
RAKE_COMMAND="${RAKE_COMMAND:-"forman-rake"}"

function die() {
    local code="$1"
    local message="$2"
    echo "$message" >&2
    exit $code
}

function build_rake() {
    echo -n "$RAKE_COMMAND "
    echo -n 'foreman_tasks:export_tasks '
    for env in TASK_SEARCH TASK_FILE TASK_FORMAT TASK_DAYS; do
        local value="${!env}"
        [ -n "${value}" ] && echo -n "${env}=$(printf '%q' "$value") "
    done
    echo
}

function usage() {
        cat << EOF
Usage: $PROGNAME [options]

An interface script for setting environment variables properly
for foreman-tasks:export_tasks rake task. By default only prints
the command to run, with -E|--execute flag performs the export.

Environment variables:
RAKE_COMMAND: can be used to redefine path to rake, by default foreman-rake

Script options:
EOF
        cat <<EOF | column -s\& -t
-E|--execute & execute the created rake command
-h|--help & show this output
EOF

        echo
        echo Export options:
        cat <<EOF | column -s\& -t
-d|--days DAYS & export only tasks started within the last DAYS days
-f|--format FORMAT & export tasks in FORMAT, one of html, html-dir, csv
-o|--output FILE & export tasks into FILE, a random file will be used if not provided
-s|--search QUERY & use QUERY in scoped search format to match tasks to export
EOF
}

SHORTOPTS="d:Ehs:o:f:"
LONGOPTS="days:,execute,help,search:,output:,format:"

ARGS=$(getopt -s bash \
              --options $SHORTOPTS \
              --longoptions $LONGOPTS \
              --name $PROGNAME \
              -- "$@" )

if [ $? -gt 0 ]; then
    die 1 "getopt failed"
fi

eval set -- "$ARGS"

while true; do
    case $1 in
        -d|--days)
            shift
            TASK_DAYS="$1"
            ;;
        -s|--search)
            shift
            TASK_SEARCH="$1"
            ;;
        -o|--output)
            shift
            TASK_FILE="$1"
            ;;
        -f|--format)
            case "$2" in
                "html" | "html-dir" | "csv")
                    shift
                    TASK_FORMAT="$1"
                    ;;
                *)
                    die 1 "Value for $1 must be one of html, csv. Given $2"
                    ;;
            esac
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        -E|--execute)
            EXECUTE=1
            ;;
        \?)
            die 1 "Invalid option: -$OPTARG"
            ;;
        --)
            ;;
        *)
            [ -n "$1" ] || break
            die 1 "Unaccepted parameter: $1"
            shift
            ;;
    esac
    shift
done

if [ "$EXECUTE" -eq 1 ]; then
    build_rake | sh
else
    build_rake
fi
