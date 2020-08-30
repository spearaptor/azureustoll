const mongoose = require('mongoose');
const keys = require('./Config/key');
const cookieSession = require('cookie-session');
const passport = require('passport');
const express = require('express');
const app = express();
require('./models/user');
require('./services/passport');
require('./routes/authroutes')(app);

mongoose.connect(keys.mongoURI);

app.use(
    cookieSession({
        maxAge: 30*24*60*60*100,
        keys: [keys.cookieKey]
    }));

app.use(passport.initialize());

app.use(passport.session());


const PORT = process.env.PORT || 5000;
app.listen(PORT);