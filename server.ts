import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
// @ts-ignore
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Habilitar CORS para que el APK pueda conectar
  app.use((cors as any)());

  // Proxy para evitar errores de seguridad (CORS/SSL) con la web del gobierno
  app.get("/api/contracts", async (req, res) => {
    try {
      const response = await fetch("https://contrataciondelestado.es/sindicacion/sindicacion_643/licitacionesPerfilesContratanteCompleto3.atom", {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const data = await response.text();
      res.set("Content-Type", "application/xml");
      res.send(data);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ error: "Failed to fetch contracts" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    // Modo Desarrollo (Vite)
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use((vite as any).middlewares);
  } else {
    // Modo Producción (Servir archivos estáticos)
    const distPath = path.resolve(__dirname, "dist");
    app.use((express as any).static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}

startServer();
