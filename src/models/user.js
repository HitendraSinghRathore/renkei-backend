const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const RefreshTokenSchema = new Schema({
    token: {
      type: String,
      required: false,
    },
    expiresAt: {
        type: Date,
        required: false,
    }
  }, {
    _id: false,
  }
);

const userSchema = new Schema({
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, 
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Email is invalid'],
    },
    password: {
      type: String,
      required: function () {
        return !this.isGoogleLogin;
      },
    },
    isGoogleLogin: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
      default: null, 
    },
    refreshToken: RefreshTokenSchema,
  },
  {
    timestamps: true, 
  });
  userSchema.index({ email: 1 }, { unique: true });
  userSchema.index({"refreshToken.token": 1}, { unique: true });

  userSchema.pre('save', async function save (next) {
    if (!this.isModified('password')) {
      return next();
    }
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err);
    }
    next();
  });

  userSchema.methods.comparePassword = async function comparePassword (password) {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (err) {
      return false;
    }
  };



module.exports = mongoose.model('User', userSchema);
