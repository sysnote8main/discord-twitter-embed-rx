import { serve } from "@hono/node-server";
import type { ServerType } from "@hono/node-server";
import { Hono } from "hono";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEDIA_DIR = path.resolve(__dirname, "media");
const DEFAULT_PORT = Number(process.env.TEST_MEDIA_PORT) || 18921;

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

/**
 * テスト用メディアファイルを配信する簡易HTTPサーバー
 *
 * vitest の globalSetup / globalTeardown で起動・停止する。
 * テスト内では `http://localhost:{PORT}/filename` でアクセス可能。
 *
 * ポート番号は環境変数 TEST_MEDIA_PORT で指定可能（デフォルト: 18921）。
 */
export class TestMediaServer {
  private server: ServerType | undefined;
  readonly honoApp: Hono;
  readonly port: number;

  constructor(port?: number) {
    this.port = port ?? DEFAULT_PORT;
    this.honoApp = this.buildApp();
  }

  // ============================================================
  // Hono アプリケーションの構築
  // ============================================================

  private buildApp(): Hono {
    const app = new Hono();

    // 全ファイルを静的配信
    app.get("/*", async (c) => {
      const relativePath = c.req.path.replace(/^\//, "");
      const filePath = path.join(MEDIA_DIR, relativePath);

      // ディレクトリトラバーサル対策
      if (!filePath.startsWith(MEDIA_DIR)) {
        return c.json({ error: "forbidden" }, 403);
      }

      try {
        const content = await fs.promises.readFile(filePath);
        const contentType = getContentType(filePath);
        return new Response(content, {
          headers: { "Content-Type": contentType },
        });
      } catch {
        return c.json({ error: "not found" }, 404);
      }
    });

    return app;
  }

  // ============================================================
  // ライフサイクル
  // ============================================================

  get listeningPort(): number | undefined {
    if (!this.server) return undefined;
    const addr = this.server.address();
    if (addr && typeof addr === "object") {
      return addr.port;
    }
    return undefined;
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = serve(
          {
            fetch: this.honoApp.fetch,
            port: this.port,
            hostname: "127.0.0.1",
          },
          (info) => {
            console.log(`[TestMediaServer] Listening on http://127.0.0.1:${info.port}`);
            resolve();
          },
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }
      this.server.close((err) => {
        if (err) {
          console.error(`[TestMediaServer] Error during shutdown: ${err.message}`);
          reject(err);
          return;
        }
        console.log("[TestMediaServer] Stopped");
        this.server = undefined;
        resolve();
      });
    });
  }
}
