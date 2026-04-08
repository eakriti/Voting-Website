const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');

// DB connection
require('./db');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

app.use('/api/users', userRoutes);
app.use('/api/candidates', candidateRoutes);

// Test route
app.get('/', (req, res) => {
  res.send("API running...");
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
