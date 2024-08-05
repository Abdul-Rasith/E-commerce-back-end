// database connection
const mongoose = require('mongoose')
require('dotenv').config();
const connect = mongoose.connect(process.env.MONGODB)

// check database connect or not
connect.then(()=>{
    console.log("Database connected successfully")
})
.catch(()=>{
    console.log("DB can not be connected")
})
// create schema
const LoginSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

//collection part
const collection = new mongoose.model('news',LoginSchema)

module.exports = collection;