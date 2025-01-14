const User = require("../models/user");

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
    const user = User.create({ name, email, password, phone });
    await user.save();
    res.status(201).json({ msg: 'User created successfully' });
   } catch (err) {
       console.error('Error occured in signup controller');
       next(err);
   }
}

function loginController(req, res,next) {
    console.log('Login controller');
}

module.exports = {
    signupController,
    loginController
};