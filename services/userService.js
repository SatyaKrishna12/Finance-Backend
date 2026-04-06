const { User, ROLE, STATUS, ALLOWED_ROLES, ALLOWED_STATUS } = require('../models/User');

function buildValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

async function getUserById(id) {
  return User.findById(id);
}

async function getUserByEmail(email) {
  return User.findOne({ email: String(email).trim().toLowerCase() }).select('+password');
}

async function listUsers() {
  return User.find().sort({ createdAt: -1 });
}

async function createUser({ name, email, password, role = ROLE.VIEWER, status = STATUS.ACTIVE }) {
  if (!name || !email || !password) {
    throw buildValidationError('name, email and password are required');
  }

  if (String(password).trim().length < 8) {
    throw buildValidationError('password must be at least 8 characters long');
  }

  if (!ALLOWED_ROLES.includes(role)) {
    throw buildValidationError(`Invalid role. Allowed values: ${ALLOWED_ROLES.join(', ')}`);
  }

  if (!ALLOWED_STATUS.includes(status)) {
    throw buildValidationError(`Invalid status. Allowed values: ${ALLOWED_STATUS.join(', ')}`);
  }

  const existing = await User.findOne({ email: String(email).trim().toLowerCase() });
  if (existing) {
    const error = new Error('A user with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const user = new User({
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    password: String(password),role,status,
  });
  return user.save();
}

async function updateUser(userId, updates) {
  if (!updates || Object.keys(updates).length === 0) {
    throw buildValidationError('At least one field must be provided for update');
  }

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (updates.name !== undefined) {
    const name = String(updates.name).trim();
    if (!name) {
      throw buildValidationError('name cannot be empty');
    }
    user.name = name;
  }

  if (updates.email !== undefined) {
    const email = String(updates.email).trim().toLowerCase();
    if (!email) {
      throw buildValidationError('email cannot be empty');
    }

    const duplicate = await User.findOne({ email, _id: { $ne: userId } });
    if (duplicate) {
      const error = new Error('A user with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    user.email = email;
  }

  if (updates.role !== undefined) {
    if (!ALLOWED_ROLES.includes(updates.role)) {
      throw buildValidationError(`Invalid role. Allowed values: ${ALLOWED_ROLES.join(', ')}`);
    }
    user.role = updates.role;
  }

  if (updates.status !== undefined) {
    if (!ALLOWED_STATUS.includes(updates.status)) {
      throw buildValidationError(`Invalid status. Allowed values: ${ALLOWED_STATUS.join(', ')}`);
    }
    user.status = updates.status;
  }

  if (updates.password !== undefined) {
    const nextPassword = String(updates.password);
    if (nextPassword.trim().length < 8) {
      throw buildValidationError('password must be at least 8 characters long');
    }
    user.password = nextPassword;
  }

  return user.save();
}

async function validateCredentials(email, password) {
  const user = await getUserByEmail(email);
  if (!user) {
    return null;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return null;
  }

  return user;
}

module.exports = {ROLE,STATUS,ALLOWED_ROLES,ALLOWED_STATUS,
  getUserById,listUsers,createUser,updateUser,validateCredentials};
