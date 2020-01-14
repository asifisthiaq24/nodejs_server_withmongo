const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv/config');
const app = express();
//import routes
const postsRoute = require('./routes/posts')
const loginRoute = require('./routes/login')
//middlewares
//app.use('/posts',()=>console.log('middleware running'))
app.use(cors());
app.use(bodyParser.json())
app.use('/posts',postsRoute)
app.use('/login',loginRoute)
//routes
app.get('/', (req,res)=>{
    res.send('Hello World');
})



mongoose.connect(process.env.DB_CONNECTION,{ useUnifiedTopology: true,useNewUrlParser: true },()=>console.log('DB Connection Successful'))
app.listen(7667)
