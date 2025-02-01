const passport = require('passport');
const User = require('../models/user');
const { generateRefreshToken, generateAccessToken } = require('../utils/tokenUtils');
const config = require('../config');
async function signupController(req, res, next) {
   const { firstName, lastName, email, password, phone } = req.body;
   try {
    const exiistingUser = await User.findOne({ email });
    if (exiistingUser) {
        console.error('Email already in use');
        return res.status(409).json({ msg: 'Email already in use' });
    }
    let name = firstName;
    if (lastName) {
        name = `${firstName} ${lastName}`;
    }
    const user = new User({ name, email, password, phone });
    await user.save();
    res.status(201).json({ msg: 'User created successfully' });
   } catch (err) {
       console.error('Error occured in signup controller');
       next(err);
   }
}

async function loginController(req, res,next) {
    const  { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ msg: 'User not found' });
        } 
        if( user.isGoogleLogin ) {
            return res.status(401).json({ msg: 'User email is registered with google' });   
        }
        const isVerified = await user.comparePassword(password);
        if (!isVerified) {
            return res.status(401).json({ msg: 'Invalid email or password' });
        }
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        user.refreshToken = {
            token: refreshToken,
            expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        };
        await user.save();
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, // for now
            sameSite: 'lax',
            maxAge: 6 * 60 * 60 * 1000,
            path: '/'
        });
        console.log('User logged in successfully');
        return res.status(200).json({ msg: 'User logged in successfully', accessToken });
    } catch (err) {
        console.error('Error occured in login controller');
        next(err);
    }
}

async function logoutContoller(req, res,next) {
    const { user } = req;
    if(!user) {
        return res.status(401).json({ msg: 'User not logged in' });
    }
    try {
        const user  = await User.findByIdAndDelete(user._id);
        if(!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        user.refreshToken = undefined;
        await user.save();

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: false, // for now
            sameSite: 'lax',
             path: '/'
        });
        console.log('User logged out successfully');
        return res.status(200).json({ msg: 'User logged out successfully' });

    } catch(err) {
        console.error('Error occured in logout controller');
        next(err);
    }
}
function googleAuth(req,res,next) { 
    return passport.authenticate('google', { scope: ['profile', 'email'] , session: false })(req,res,next);
}
function googleCallback(req, res, next) { 
    console.log('Google callback called');
    passport.authenticate('google', { session: false }, async function(err, user) { 
        if(err) {
            console.log('Error occured in google callback %o', err);
            return next(err);
        }
        if(!user) {
            console.log('User not found in callback');
            return res.status(401).json({ msg: 'User authenticaion failed' });
        }
        try {
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);
            user.refreshToken = {
                token: refreshToken,
                expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000)
            };
            await user.save();
            console.log('User refresh token generated');
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false, // for now
                sameSite: 'lax',
                maxAge: 6 * 60 * 60 * 1000, 
                path: '/'
              });
            console.log('User logged in successfully');
            return res.redirect(`${config.get('uiDomain')}/auth/callback#accessToken=${accessToken}`);

        } catch (err) {
            console.error('Error occured in generating access token %o', err);
            return next(err);
        }
    })(req,res,next);
}
module.exports = {
    signupController,
    loginController,
    logoutContoller,
    googleAuth,
    googleCallback
};