#!/bin/sh
rm package-lock.json
ip route del default
ip route add default via 10.0.10.254
exec npm run dev