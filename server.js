// server start
const dotenv = require('dotenv');
const app = require('./app');
dotenv.config({ path: './config.env' });
// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
