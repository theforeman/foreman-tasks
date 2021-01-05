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
    echo -n 'foreman_tasks:cleanup '
    for env in AFTER TASK_BACKUP BATCH_SIZE NOOP TASK_SEARCH STATES VERBOSE; do
        local value="${!env}"
        [ -n "${value}" ] && echo -n "${env}=$(printf '%q' "$value") "
    done
    echo
}

function usage() {
        cat << EOF
Usage: $PROGNAME [script_options...] [options...]

An interface script for setting environment variables properly
for foreman-tasks:cleanup rake task. By default only prints
the command to run, with -E|--execute flag performs the cleanup.

Environment variables:
RAKE_COMMAND: can be used to redefine path to rake, by default foreman-rake

Script options:
EOF
        cat <<EOF | column -s\& -t
-E|--execute & execute the created rake command
-h|--help & show this output
EOF

        echo
        echo Cleanup options:
        cat <<EOF | column -s\& -t
-B|--batch-size BATCH_SIZE & process tasks in batches of BATCH_SIZE, 1000 by default
-S|--states STATES & operate on tasks in STATES, comma separated list of states, set to all to operate on tasks in any state
-a|--after AGE & operate on tasks older than AGE. Expected format is a number followed by the time unit (s,h,m,y), such as '10d' for 10 days
-b|--backup & backup deleted tasks
-n|--noop & do a dry run, print what would be done
-s|--search QUERY & use QUERY in scoped search format to match tasks to delete
-v|--verbose & be verbose
EOF
}

SHORTOPTS="a:bB:Ehns:S:v"
LONGOPTS="after:,backup,batch-size:,execute,help,noop,search:,states:,verbose"

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
        -a|--after)
            shift
            AFTER="$1"
            ;;
        -b|--backup)
            TASK_BACKUP=true
            ;;
        -B|--batch-size)
            shift
            BATCH_SIZE="$1"
            ;;
        -n|--noop)
            NOOP=1
            ;;
        -s|--search)
            shift
            TASK_SEARCH="$1"
            ;;
        -S|--states)
            shift
            if [ "$1" == "all" ]; then
                STATES=","
            else
                STATES="$1"
            fi
            ;;
        -v|--verbose)
            VERBOSE=1
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

