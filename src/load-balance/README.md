# 负载均衡

node 开启两个服务后，nginx.conf 添加下列配置

```sh
# nginx.conf

# 负载均衡
upstream nginx-load-balance {
  # 让相同的客户端ip请求相同的服务器
  # ip_hash;
  # weight=>权重默认是1
  server 127.0.0.1:5201 weight=1;
  server 127.0.0.1:5202 weight=9;
  # 热备=>当除了它前面的服务器发生故障时开启服务
  # server 127.0.0.1:5202 backup;
}

server {
  listen 5200;
  location / {
    proxy_pass http://nginx-load-balance;
  }
}
```

浏览器打开 http://localhost:5200 ，不断刷新，控制台可以看到两个服务的打印不停的切换
