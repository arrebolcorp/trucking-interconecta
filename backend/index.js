require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const session = require('express-session');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));

const upload = multer({ dest: 'uploads/' });

const tenantPools = {};
function getTenantPool(tenant) {
  if (!tenantPools[tenant]) {
    tenantPools[tenant] = new Pool({
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: `${process.env.PG_DATABASE}_${tenant}`
    });
  }
  return tenantPools[tenant];
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.post('/login', async (req, res) => {
  const { username, password, tenant } = req.body;
  try {
    const pool = getTenantPool(tenant);
    const result = await pool.query('SELECT id, password_hash FROM users WHERE username = $1', [username]);
    if (result.rowCount === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const payload = { userId: user.id, tenant };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
    req.session.tenant = tenant;
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/profile', authenticateToken, async (req, res) => {
  const { userId, tenant } = req.user;
  try {
    const pool = getTenantPool(tenant);
    const result = await pool.query('SELECT id, username FROM users WHERE id = $1', [userId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
  res.json({ file: req.file });
});

function startServer() {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer, authenticateToken };
