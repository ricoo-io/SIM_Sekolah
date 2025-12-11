import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import sequelize from './config/database.js';
import apiRoutes from './routes/api.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

import './models/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = {};
    if (err.errors) {
      err.errors.forEach((e) => {
        const field = e.path;
        const message = e.message;
        if (!errors[field]) errors[field] = [];
        errors[field].push(message);
      });
    }
    return res.status(422).json({
      message: 'Validation error',
      errors
    });
  }

  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
    }

    app.listen(PORT, () => {
    });
  } catch (error) {
    console.error('✗ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
