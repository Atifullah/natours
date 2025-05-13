const express = require('express');
const fs = require('fs');

const app = express();

// Start the server
const PORT = 3000;

// Middleware
app.use(express.json());

// // Routes
// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'Welcome to the API!', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.status(200).send('POST request received');
// });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
