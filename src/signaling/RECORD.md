# 信令服务器

## 自签证书

我们可以通过 openssl 生成自签证书，并将其保存在本地。
但是好麻烦，这里我使用 mkcert 工具生成自签证书，并将其保存在本地。

```sh
brew install mkcert
mkcert -install
```

```sh
mkcert localhost 127.0.0.1 ::1
```

https://www.jianshu.com/p/7cb5c2cffaaa

## webRTC 的安全隐患

https://www.expressvpn.com/webrtc-leak-test

https://www.expressvpn.com/webrtc-leak-test#chrome

https://www.expressvpn.com/internet-privacy/webrtc-leaks/

## IP 查询

https://www.ip138.com/

https://nordvpn.com/zh/ip-lookup/

获取 IP 地址
https://iq.opengenus.org/get-ip-addresses-using-javascript/

检测 ice 穿透的在线工具

https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
