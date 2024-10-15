const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the PostgreSQL connection pool
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres.dpvwhawaqvfskesahkvj:abdulrehman344@aws-0-ap-south-1.pooler.supabase.com:6543/postgres",
});

// Verify connection to the database on server start
pool.connect((err, client, release) => {
  if (err) {
    console.error("Database connection error:", err.stack);
    process.exit(1); // Exit if there is a connection error
  } else {
    console.log("Database connected successfully");
    release();
  }
});

// Default route
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Insert a new task into the database
app.post("/api/todo", async (req, res) => {
  const { todo_title,todo_description } = req.body;



  const query = `
    INSERT INTO todo (todo_title,todo_description)
    VALUES ($1, $2) RETURNING *
  `;
  const values = [todo_title,todo_description];

  try {
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database insert error:", err.stack);
    res
      .status(500)
      .json({ error: "Database insert error", details: err.message });
  }
});

// Get all tasks
app.get("/api/todo", async (req, res) => {
  const query = "SELECT * FROM todo";

  try {
    const result = await pool.query(query);
    res.json(result.rows); // Return all tasks
  } catch (err) {
    console.error("Database query error:", err.stack);
    res
      .status(500)
      .json({ error: "Database query error", details: err.message });
  }
});

// Get task details by ID
app.get("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;

  const query = "SELECT * FROM consumertasks WHERE id = $1";
  const values = [id];

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(result.rows[0]); // Return the task details
  } catch (err) {
    console.error("Database query error:", err.stack);
    res
      .status(500)
      .json({ error: "Database query error", details: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
