const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

if (!process.env.DATABASE || !process.env.DATABASE_PASSWORD) {
  throw new Error('DATABASE and DATABASE_PASSWORD must be set in config.env');
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('Set JWT_SECRET to a random secret of at least 32 characters');
}
if (!process.env.JWT_EXPIRES_IN) {
  throw new Error('Set JWT_EXPIRES_IN in config.env');
}

if (process.env.DATABASE_PASSWORD.startsWith('replace_with_')) {
  throw new Error(
    'Replace the DATABASE_PASSWORD placeholder in config.env with your MongoDB password'
  );
}

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  encodeURIComponent(process.env.DATABASE_PASSWORD)
);

const port = process.env.PORT || 3000;
let server;

const startServer = async () => {
  await mongoose.connect(DB);
  console.log('DB connection successful!');
  server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
  });
};

startServer().catch(err => {
  console.error('Unable to start the application:', err.message);
  process.exitCode = 1;
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  if (server) {
    server.close(() => {
      console.log('💥 Process terminated!');
    });
  }
});
