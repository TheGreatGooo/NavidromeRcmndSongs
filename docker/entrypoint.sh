#!/bin/bash
RUN_PORT="8000"

/opt/venv/bin/gunicorn favorites:app --error-logfile /app/log.log --timeout 300 --bind "0.0.0.0:${RUN_PORT}" --daemon

nginx -g 'daemon off;'
