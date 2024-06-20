const express = require('express');
const app = express();
require('dotenv').config()

app.use(express.json())
app.use(require('./routes/index.route'))

app.listen(process.env.PORT, () => { console.log(`Express running on server ${process.env.PORT}`) })
    .on('error', () => { console.log(error.message) })
