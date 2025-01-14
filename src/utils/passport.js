const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const config = require('../config');

passport.use(new GoogleStrategy({
    clientID: config.get('googleClientId'),
    clientSecret: config.get('googleClientSecret'),
    callbackURL: config.get('googleCallbackUrl')
},async function(_, _, profile, done) {
    try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        let user = await User.findOne({ email });
        if(user) {
            if(!user.isGoogleLogin) { 
                return done(null, false, { message: 'Email already in use with different login method.' }); 
            }
        } else {
            user = new User({
                email,
                name,
                isGoogleLogin: true

            });
            await user.save();
            console.log('User created');
        }
        return done(null, user);

    } catch (err) {
        console.error('Error with google strategy %o', err);
        return done(err, null);
    }
}
));


module.exports = passport;