const {ALLOWED_ROLES,ALLOWED_STATUS,listUsers,getUserById,createUser,updateUser
} = require('../services/userService');

function getCurrentUser(req, res) {
  return res.status(200).json({ data: req.user });
}

async function getUsers(req, res, next) {
  try {
    const users = await listUsers();
    return res.status(200).json({ data: users });
  } catch (error) {
    return next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    return next(error);
  }
}

async function createUserHandler(req, res, next) {
  try {
    const role = req.body.role ? String(req.body.role).toLowerCase() : undefined;
    const status = req.body.status ? String(req.body.status).toLowerCase() : undefined;

    const newUser = await createUser({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role,
      status,
    });

    return res.status(201).json({ data: newUser });
  } catch (error) {
    return next(error);
  }
}

async function updateUserHandler(req, res, next) {
  try {
    const updates = {};

    if (req.body.name !== undefined) {
      updates.name = req.body.name;
    }

    if (req.body.email !== undefined) {
      updates.email = req.body.email;
    }

    if (req.body.role !== undefined) {
      updates.role = String(req.body.role).toLowerCase();
    }

    if (req.body.status !== undefined) {
      updates.status = String(req.body.status).toLowerCase();
    }

    if (req.body.password !== undefined) {
      updates.password = req.body.password;
    }

    const updatedUser = await updateUser(req.params.userId, updates);
    return res.status(200).json({ data: updatedUser });
  } catch (error) {
    return next(error);
  }
}

function getRoleMeta(req, res) {
  return res.status(200).json({
    data: {
      roles: ALLOWED_ROLES,
      status: ALLOWED_STATUS,
    },
  });
}

module.exports = {getCurrentUser,getUsers,getUser,createUserHandler,updateUserHandler,getRoleMeta
};
