#!/bin/bash
set -e
cd "$(dirname "$0")/apps/original"
exec ./start.command
