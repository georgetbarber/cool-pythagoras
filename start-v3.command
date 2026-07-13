#!/bin/bash
set -e
cd "$(dirname "$0")/apps/v3"
exec ./start.command
