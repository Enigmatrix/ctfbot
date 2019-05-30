import axios, { AxiosProxyConfig, AxiosStatic } from "axios-https-proxy-fix";
const rateLimit = require ("axios-rate-limit").default;

export const COMMON_UA = "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0";

axios.defaults.headers['User-Agent'] = COMMON_UA;
const axios2: AxiosStatic = rateLimit(axios, {maxRequests: 1, perMilliseconds: 2000});
/*require('axios-debug')(axios);*/
/*import { chooseRandom } from "./util";
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
});*/

export default axios2;
