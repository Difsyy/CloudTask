const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

// ---- In-memory "database" (simple for assignment) ----
// NOTE: Data resets if the service restarts.
let todos = [
  { id: 1, text: "Bismillah dapat A", done: false },
  { id: 2, text: "Quiz Cloud", done: false },
  { id: 3, text: "Belajar Cloud", done: false }
];
let nextId = 4;

// ---- API ----
app.get("/api/todos", (req, res) => {
  res.json(todos);
});

app.post("/api/todos", (req, res) => {
  const text = (req.body?.text || "").trim();
  if (!text) return res.status(400).json({ error: "text is required" });

  const item = { id: nextId++, text, done: false };
  todos.unshift(item);
  res.status(201).json(item);
});

app.patch("/api/todos/:id/toggle", (req, res) => {
  const id = Number(req.params.id);
  const item = todos.find(t => t.id === id);
  if (!item) return res.status(404).json({ error: "not found" });

  item.done = !item.done;
  res.json(item);
});

app.delete("/api/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = todos.length;
  todos = todos.filter(t => t.id !== id);
  if (todos.length === before) return res.status(404).json({ error: "not found" });

  res.status(204).send();
});

// ---- Serve frontend ----
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Railway provides PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
