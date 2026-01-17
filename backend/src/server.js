const path = require('path');

try {
  // 尝试加载根目录的 .env 文件
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
} catch (error) {
  // dotenv is optional in production
}

const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Mochan API running at http://localhost:${PORT}`);
});
