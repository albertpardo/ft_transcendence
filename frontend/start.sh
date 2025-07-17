#!/bin/sh

while true; do
  serve -s dist -l 3000
  echo "Serve exited — restarting in 2s..."
  sleep 2
done
