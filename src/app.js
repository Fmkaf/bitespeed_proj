const express = require('express');
const app = express();
const mongoose = require('mongoose')
require('dotenv').config()

app.use(express.json())
mongoose.connect("mongodb://localhost:27017/bytespeed").then(() => { console.log("MongoDB connection success") })
    .catch((error) => { console.log(error) })
app.use(require('./routes/index.route'))

app.listen(process.env.PORT, () => { console.log(`Express running on server ${process.env.PORT}`) })
    .on('error', () => { console.log(error.message) })
