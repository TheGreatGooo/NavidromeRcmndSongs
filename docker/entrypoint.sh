#!/bin/bash
RUN_PORT="8000"

/opt/venv/bin/gunicorn favorites:app --bind "0.0.0.0:${RUN_PORT}" --daemon

nginx -g 'daemon off;'
