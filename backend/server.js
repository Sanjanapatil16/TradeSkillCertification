const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Serve the built React frontend (production)
const dist = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(dist));
app.use((req, res) => {
  res.sendFile(path.join(dist, "index.html"), (err) => {
    if (err) res.status(404).send("Frontend not built. Run: npm run build --prefix frontend");
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
