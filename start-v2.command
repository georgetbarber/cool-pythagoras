#!/bin/bash
set -e
cd "$(dirname "$0")/apps/v2"
exec ./start.command
