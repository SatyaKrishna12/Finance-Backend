const express = require('express');
const authContext = require('../middlewares/authContext');
const authorize = require('../middlewares/authorize');
const { ROLE } = require('../services/userService');
const {
  getCurrentUser,
  getUsers,
  getUser,
  createUserHandler,
  updateUserHandler,
  getRoleMeta,
} = require('../controllers/userController');

const router = express.Router();

router.use(authContext);

router.get('/me', getCurrentUser);
router.get('/meta', authorize(ROLE.ADMIN), getRoleMeta);
router.get('/', authorize(ROLE.ADMIN), getUsers);
router.get('/:userId', authorize(ROLE.ADMIN), getUser);
router.post('/', authorize(ROLE.ADMIN), createUserHandler);
router.patch('/:userId', authorize(ROLE.ADMIN), updateUserHandler);

module.exports = router;
