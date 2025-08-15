const express = require('express');
const cors = require('cors');
const contractsRoute = require('./routes/contracts');
require('dotenv').config();

const userRoutes = require('./routes/users');

const app = express();

// ✅ FIXED: Single CORS configuration that allows all origins for testing
app.use(cors({
  origin: "*", // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false // Set to false when using origin: "*"
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ ROUTES (place all routes AFTER CORS middleware)
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const firmsRoutes = require('./routes/firms')
app.use("/api/firms", firmsRoutes)

app.use('/api/users', userRoutes);

app.use("/uploads", express.static("uploads"));

app.use("/api/applications", require("./routes/applications"))

const fileRoutes = require("./routes/files");
app.use("/api/files", fileRoutes);

const temporaryPassesRouter = require('./routes/temporaryPasses');
app.use('/api/temporary-passes', temporaryPassesRouter);

app.use('/api/contracts', contractsRoute);

const safetyRoutes = require("./routes/safety");
app.use("/api/safety", safetyRoutes);

// ✅ IMPORTANT: Gate pass routes
app.use('/api/gatepass', require('./routes/applications'));

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.get("/health", (req, res) => res.send("OK"));

// ✅ REMOVED: Duplicate CORS configurations that were causing conflicts

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});