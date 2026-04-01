import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const CAMERAS_FILE = path.join(DATA_DIR, "cameras.json");

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([{ id: "1", username: "admin", role: "Admin", password: "admin" }]));
if (!fs.existsSync(CAMERAS_FILE)) fs.writeFileSync(CAMERAS_FILE, JSON.stringify([]));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // User Login
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    const user = users.find((u: any) => u.username === username && u.password === password);
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Get All Users (Admin Only)
  app.get("/api/users", (req, res) => {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    res.json(users.map(({ password, ...u }: any) => u));
  });

  // Add User
  app.post("/api/users", (req, res) => {
    const newUser = req.body;
    const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    if (users.some((u: any) => u.username === newUser.username)) {
      return res.status(400).json({ error: "Username already exists" });
    }
    users.push({ ...newUser, id: Date.now().toString() });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.status(201).json({ success: true });
  });

  // Delete User
  app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;
    let users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    users = users.filter((u: any) => u.id !== id);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.json({ success: true });
  });

  // Get All Cameras
  app.get("/api/cameras", (req, res) => {
    const cameras = JSON.parse(fs.readFileSync(CAMERAS_FILE, "utf-8"));
    res.json(cameras);
  });

  // Update Camera
  app.post("/api/cameras", (req, res) => {
    const camera = req.body;
    let cameras = JSON.parse(fs.readFileSync(CAMERAS_FILE, "utf-8"));
    const index = cameras.findIndex((c: any) => c.id === camera.id);
    
    if (index !== -1) {
      cameras[index] = { ...cameras[index], ...camera };
    } else {
      cameras.push(camera);
    }
    
    fs.writeFileSync(CAMERAS_FILE, JSON.stringify(cameras, null, 2));
    res.json({ success: true });
  });

  // Delete Camera
  app.delete("/api/cameras/:id", (req, res) => {
    const { id } = req.params;
    let cameras = JSON.parse(fs.readFileSync(CAMERAS_FILE, "utf-8"));
    cameras = cameras.filter((c: any) => c.id !== id);
    fs.writeFileSync(CAMERAS_FILE, JSON.stringify(cameras, null, 2));
    res.json({ success: true });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 LOCAL SERVER RUNNING`);
    console.log(`PC Access: http://localhost:${PORT}`);
    console.log(`Network Access: http://[YOUR-PC-IP]:${PORT}\n`);
  });
}

startServer();
