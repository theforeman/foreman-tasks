#!/bin/bash

# This file provides additional debug information for foreman-debug tool and is
# symlinked as /usr/share/foreman/script/foreman-debug.d/60-dynflow_debug

add_files /var/log/foreman/dynflow_executor*.log*
add_files /var/log/foreman/dynflow_executor*.output*
