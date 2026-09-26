const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`StockSense API Backend listening on http://localhost:${PORT}`);
});
