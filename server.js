const express = require('express');
const app = express();
const port = 3001;

app.use(express.static('.'));

app.get('/', (req, res) => {
  res.send('Hello, your server is running!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});