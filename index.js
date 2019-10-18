require('dotenv').config();

const environment = process.env.NODE_ENV;
const stage = require('./app/config')[environment];

const logger = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require('./app/routes/index');

const app = express();
const router = express.Router();

if(environment == 'development'){
  app.use(logger('dev'));
}

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use('/api', routes(router));

const dbString = stage.dbHost + stage.dbName;

//Connect to db
mongoose.connect(dbString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'DB Connection error: '));

if(!db){
  console.log('Error connecting to DB');
}else{
  console.log('***** Db connected successfully');
}

app.listen(`${stage.port}`, () => {
  console.log(`****** Running Presidea on port ${stage.port}`);
});

//For testing
module.exports = app;