import axios, { AxiosProxyConfig } from "axios-https-proxy-fix";
import { chooseRandom } from "./util";
const ProxyList = require("proxy-sources");

axios.interceptors.request.use(async config => {
  let proxyAddrs = { list: [], random: () => "" };
  do {
    proxyAddrs = await ProxyList({
      checker: true,
      timeout: 1e3
    });
  } while (proxyAddrs.list.length === 0);
  const chosenProxyAddrParts = proxyAddrs.random().split(":");
  const chosenProxy: AxiosProxyConfig = {
    host: chosenProxyAddrParts[0],
    port: +chosenProxyAddrParts[1]
  };
  console.log(`Using proxy ${chosenProxyAddrParts} for ${config.url}`);
  config.proxy = chosenProxy;
  return config;
});

export default axios;
