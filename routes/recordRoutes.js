const express = require('express');
const authContext = require('../middlewares/authContext');
const authorize = require('../middlewares/authorize');
const { ROLE } = require('../services/userService');
const {
  getRecords,
  getRecord,
  createRecordHandler,
  updateRecordHandler,
  deleteRecordHandler,
} = require('../controllers/recordController');

const router = express.Router();

router.use(authContext);

router.get('/', authorize(ROLE.ANALYST, ROLE.ADMIN), getRecords);
router.get('/:recordId', authorize(ROLE.ANALYST, ROLE.ADMIN), getRecord);
router.post('/', authorize(ROLE.ADMIN), createRecordHandler);
router.patch('/:recordId', authorize(ROLE.ADMIN), updateRecordHandler);
router.delete('/:recordId', authorize(ROLE.ADMIN), deleteRecordHandler);

module.exports = router;
