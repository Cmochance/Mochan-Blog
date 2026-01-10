const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const { parseCorsOrigins } = require('./utils/env');
const { registerModules } = require('./modules');

const app = express();
app.disable('x-powered-by');

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGIN);
app.use(
  cors({
    origin: corsOrigins === '*' ? '*' : corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);

registerModules(app, {});

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || '服务器错误' });
});

module.exports = app;
