const passport = require('passport');
const mongoose = require('mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('../Config/key');

const User = mongoose.model("user");

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id)
        .then((user) => {
            done(null, user);
        })
})

passport.use(new GoogleStrategy(
    {
    clientID: config.googleClientID,
    clientSecret: config.googleClientSecret,
    callbackURL: '/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
        User.findOne({googleId : profile.id})
        .then((existingUser) => {
            if(existingUser){
                done(null, existingUser);
            }
            else{
                new User({googleId : profile.id})
                .save()
                .then(user => {
                    done(null, user);
                })

            }

        })
        // console.log("accessToke: ", accessToken);
        // console.log("refreshToken: ", refreshToken);
        // console.log("profile :", profile);
       
    }) 
);