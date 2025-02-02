const User = require('../models/user');

async function getProfileDetails(req, res,next) {
    console.log('Fetching profile details');
    try {
        const { user } = req;
        if(!user) {
            return res.status(401).json({ msg: 'User not logged in' });
        }
        const userDetails = await User.findById(user.id);
        if(!userDetails) {
            return res.status(400).json({ msg: 'User not found' });
        }
        const [firstName, lastName = ''] = userDetails.name.split(' ');
        return res.status(200).json({
            id: userDetails._id,
            firstName,
            lastName,
            email: userDetails.email,
            phone: userDetails.phone,
            isGoogleLogin: userDetails.isGoogleLogin,
        });
    } catch (err) {
        console.error('Error occured in getProfileDetails controller');
        next(err);
    }
}
async function updateProfileDetails(req, res,next) {
    console.log('Updating profile details');
    try {
        const { user } = req;
        if(!user) {
            return res.status(401).json({ msg: 'User not logged in' });
        }
        const { firstName, lastName, phone } = req.body;
        const userDetails = await User.findById(user.id);
        if(!userDetails) {
            return res.status(400).json({ msg: 'User not found' });
        }
        let name = firstName;
        if(lastName) {
            name = `${firstName} ${lastName}`;
        }
        userDetails.name = name;
        userDetails.phone = phone;
        await userDetails.save();
        return res.status(200).json({ msg: 'Profile updated successfully' });
    } catch (err) {
        console.error('Error occured in updateProfileDetails controller');
        next(err);
    }
}


module.exports = {
    getProfileDetails,
    updateProfileDetails
};