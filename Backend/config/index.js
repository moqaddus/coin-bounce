const dotenv=require('dotenv').config();
//const dbConnect=require('../database/index')

const PORT=process.env.PORT;
const connectionString=process.env.connectionString;
const BACKEND_SERVER_PATH=process.env.BACKEND_SERVER_PATH;
const AccessTokenSecret=process.env.AccessTokenSecret;
const RefershTokenSecret=process.env.RefershTokenSecret;
module.exports={
  PORT,
  connectionString,
  AccessTokenSecret,
  RefershTokenSecret,
  BACKEND_SERVER_PATH,
}