import { existsSync, promises } from "fs";
import { join } from "path";
import { createServer } from "http";
import { createProxyServer } from "http-proxy";
import axios from "axios";

const PORT = 8000;
const timeout = 1000; 
const proxy = createProxyServer({});
const maxTries = 5; 

async function isBackendAlive(url: string): Promise<boolean> {
  try {
    const response = await axios.get(`${url}/api/chord/alive`, { timeout });
    return response.status === 200;
  } catch (error: any) {
    console.error(`Error checking backend (${url}):`, error.message || error);
    return false;
  }
}

const getTargetUrl = async (tries = 0): Promise<string> => {
  if (tries >= maxTries) {
    throw new Error(`No backend alive after ${maxTries} attempts.`);
  }

  const filePath = join(__dirname, "url.txt");

  try {
    if (!existsSync(filePath)) {
      throw new Error(`File ${filePath} not found`);
    }

    const backUrl = (await promises.readFile(filePath, "utf8")).trim();
    
    if (!backUrl) {
      throw new Error("Backend URL file is empty.");
    }

    if (await isBackendAlive(backUrl)) {
      return backUrl;
    }

    return getTargetUrl(tries + 1);
  } catch (error) {
    console.error("Error reading backend URL:", error);
    throw new Error("Unable to determine target backend URL.");
  }
};

const server = createServer(async (req, res) => {
  try {
    const targetUrl = await getTargetUrl();
    console.log(`Forwarding request to ${targetUrl}`);

    proxy.web(req, res, { target: targetUrl }, (err) => {
      if (err) {
        console.error("Error forwarding request:", err);
        res.writeHead(502, { "Content-Type": "text/plain" });
        res.end("Bad Gateway: Error forwarding request");
      }
    });
  } catch (error) {
    console.error("No alive backend found:", error.message || error);
    res.writeHead(503, { "Content-Type": "text/plain" });
    res.end("Service Unavailable: No alive backend found");
  }
});

server.listen(PORT, () => {
  console.log(`Proxy server listening on http://localhost:${PORT}`);
});
