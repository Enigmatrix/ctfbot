import axios from "axios";


export const COMMON_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36";

axios.defaults.headers["User-Agent"] = COMMON_UA;


export default axios;
