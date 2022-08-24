import axios from "axios";

const IPV4 = "https://api.ipify.org";
const IPV6 = "https://api6.ipify.org";

export default async function getIP({ useIPv6 = false, endpoint } = {}) {
  if (endpoint === undefined) {
    endpoint = useIPv6 ? IPV6 : IPV4;
  }
  const { data } = await axios.get(endpoint);
  console.log("🚀🚀🚀 / data", data);
  return data;
}

getIP();
