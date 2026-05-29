const dotenv = require('dotenv');
const serverless = require('serverless-http');
const app = require('../app');

dotenv.config();

module.exports = serverless(app);
