const mongoose=require('mongoose');

const {connectionString}=require('../config/index')

const dbConnect=async()=>{
  try {
    const conn=await mongoose.connect(connectionString);
    console.log(`Database connectedto host:${conn.connection.host}`)
  } catch (error) {
    console.log(`Error: ${error}`)
    
  }
}

module.exports=dbConnect;
