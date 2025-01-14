const User = require("../models/user");
const { generateRefreshToken, generateAccessToken } = require("../utils/tokenUtils");

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
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 6 * 60 * 60 * 1000,
        });
        console.log('User logged in successfully');
        return res.status(200).json({ msg: 'User logged in successfully', accessToken });
    } catch (err) {
        console.error('Error occured in login controller');
        next(err);
    }
}

module.exports = {
    signupController,
    loginController
};