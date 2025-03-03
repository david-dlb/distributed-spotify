from router:base

copy router/router/route.sh /root/route.sh

copy router/router/multicast_proxy.py /root/multicast_proxy.py

run chmod +x /root/route.sh

entrypoint /root/route.sh