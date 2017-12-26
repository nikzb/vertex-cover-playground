const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true, // Cannot have another document with same value for this field
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email address'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  admin: {
    type: Boolean,
    require: true,
    default: false
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  return { _id: userObject._id, email: userObject.email, admin: userObject.admin };
};

UserSchema.methods.generateAuthToken = function() {
  const user = this;

  const access = 'auth';
  const token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET).toString();

  user.tokens.push({ access, token });

  return user.save().then(() => token);
};

UserSchema.methods.removeToken = function (token) {
  const user = this;

  return user.update({
    $pull: {
      tokens: { token }
    }
  });
};

UserSchema.statics.findByToken = function (token) {
  const User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    // return new Promise((resolve, reject) => {
    //   reject();
    // });
    // shorter version of commented out code above
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.statics.findByCredentials = async function(email, password) {
  const User = this;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  } catch (e) {
    return Promise.reject();
  }
};

UserSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } else {
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };
