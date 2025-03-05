import express, { Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();

const getTargetUrl = async (): Promise<string> => {
  const filePath = path.join(__dirname, "url.txt");
  try {
    return await fs.promises.readFile(filePath, "utf8");
  } catch (error) {
    console.error("Error al leer el archivo:", error);
    return "http://localhost:3000"; // URL por defecto en caso de error
  }
};

app.use(cors({ origin: "*" }));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[LOG] Solicitud entrante: ${req.method} ${req.url}`);
  res.on("finish", () => {
    console.log(
      `[LOG] Respuesta enviada para ${req.method} ${req.url} con status ${res.statusCode}`
    );
  });
  next();
});

// Middleware para configurar dinámicamente el proxy
app.use("/api", async (req, res, next) => {
  const target = await getTargetUrl();
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: { "^/api": "" },
  })(req, res, next);
});

const PORT = 8000;
app.listen(PORT, async () => {
  console.log(`🔄 Proxy corriendo en http://localhost:${PORT}`);
  const target = await getTargetUrl();
  console.log(`➡️ Redirigiendo tráfico a: ${target}`);
});
