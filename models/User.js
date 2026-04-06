const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLE = Object.freeze({
  VIEWER: 'viewer',
  ANALYST: 'analyst',
  ADMIN: 'admin'
});

const STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive'
});

const userSchema = new mongoose.Schema(
  {
    name: {type: String,required: true,trim: true},
    email: {type: String,required: true,unique: true,lowercase: true,trim: true},
    password: {type: String,required: true,minlength: 8,select: false},
    role: {type: String,
      enum: Object.values(ROLE),
      default: ROLE.VIEWER,
      index: true,
    },
    status: {type: String,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(String(candidatePassword), this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = {User, ROLE, STATUS, ALLOWED_ROLES: Object.values(ROLE), ALLOWED_STATUS: Object.values(STATUS),
};
