const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('../../modals/tourModal');
const User = require('../../modals/userModal');
const Review = require('../../modals/reviewModal');

dotenv.config({ path: './config.env' });

// Replace <PASSWORD> in DB string
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// MongoDB connection
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log(con.connections);
    console.log('DB connection successful');
  })
  .catch((err) => {
    console.error('DB connection error:', err);
  });

// prettier-ignore
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

console.log(tours);

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);

    console.log('data import successfully');
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('All data deleted successfully');
  } catch (err) {
    console.log('Delete error:', err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
