try {
  require('dotenv').config();
} catch (error) {
  // dotenv is optional in production
}

const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Mochan API running at http://localhost:${PORT}`);
});
