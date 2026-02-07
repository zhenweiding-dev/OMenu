import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

export default defineConfig({
  plugins: [
    react(),
    // Dev-only proxy: forward /api/* to old FastAPI backend with path rewriting
    {
      name: "api-dev-proxy",
      configureServer(server) {
        server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          if (!req.url?.startsWith("/api/") || req.method !== "POST") return next();

          // Buffer request body
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const bodyStr = Buffer.concat(chunks).toString();
          const body = bodyStr ? JSON.parse(bodyStr) : {};

          // Map new paths to old FastAPI paths
          let targetPath: string;
          let targetBody = body;

          if (req.url === "/api/generate-menu") {
            targetPath = "/api/menu-books/generate";
          } else if (req.url === "/api/modify-menu") {
            const bookId = body.bookId || "unknown";
            targetPath = `/api/menu-books/${bookId}/modify`;
            targetBody = { modification: body.modification, currentMenuBook: body.currentMenuBook };
          } else if (req.url === "/api/generate-shopping-list") {
            targetPath = "/api/shopping-lists/generate";
          } else {
            return next();
          }

          try {
            const upstream = await fetch(`http://localhost:8000${targetPath}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(targetBody),
            });
            res.statusCode = upstream.status;
            res.setHeader("Content-Type", "application/json");
            res.end(await upstream.text());
          } catch {
            res.statusCode = 502;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ code: "PROXY_ERROR", message: "Cannot reach FastAPI backend at localhost:8000" }));
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
