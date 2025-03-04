#!/bin/sh
rm package-lock.json
ip route del default
ip route add default via 10.0.10.254
exec serve -s ./dist & exec python3 ./client.py & exec node ./server/proxy.js