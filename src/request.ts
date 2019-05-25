import axios, { AxiosProxyConfig } from "axios-https-proxy-fix";
const ProxyList = require("proxy-sources");
import { chooseRandom } from './util';

axios.interceptors.request.use(async config => {
    const proxyAddrs:string[] = await ProxyList();
    const chosenProxyAddrParts = chooseRandom(proxyAddrs).split(":");
    const chosenProxy : AxiosProxyConfig = {
        host: chosenProxyAddrParts[0],
        port: +chosenProxyAddrParts[1]
    };
    console.log(`Using proxy ${chosenProxyAddrParts} for ${config.url}`);
    config.proxy = chosenProxy;
    return config;
});

export default axios;

