const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');
const additionalTours = require('./additional-tours');
const slugify = require('slugify');

dotenv.config({ path: './config.env' });

if (!process.env.DATABASE || !process.env.DATABASE_PASSWORD) {
  throw new Error('DATABASE and DATABASE_PASSWORD must be set in config.env');
}
if (process.env.DATABASE_PASSWORD.startsWith('replace_with_')) {
  throw new Error('Replace DATABASE_PASSWORD in config.env before importing data');
}

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  encodeURIComponent(process.env.DATABASE_PASSWORD)
);

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
const allTours = [...tours, ...additionalTours];

const upsertById = (Model, documents) =>
  Model.bulkWrite(
    documents.map(document => {
      const _id = new mongoose.Types.ObjectId(document._id);
      return {
        updateOne: {
          filter: { _id },
          update: { $setOnInsert: { ...document, _id } },
          upsert: true
        }
      };
    }),
    { ordered: true }
  );

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await mongoose.connect(DB);
    for (const tour of allTours) {
      await Tour.updateOne(
        { name: tour.name },
        {
          $setOnInsert: {
            ...tour,
            slug: tour.slug || slugify(tour.name, { lower: true })
          }
        },
        { upsert: true, runValidators: true }
      );
    }
    await upsertById(User, users);
    await upsertById(Review, reviews);
    console.log(`Development data loaded (${allTours.length} tours).`);
  } catch (err) {
    console.error('Unable to import development data:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await mongoose.connect(DB);
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.error('Unable to delete development data:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.error('Use --import or --delete');
  process.exitCode = 1;
}
