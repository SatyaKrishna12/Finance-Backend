const express = require('express');
const authContext = require('../middlewares/authContext');
const { getSummary, getTrends } = require('../controllers/dashboardController');

const router = express.Router();

router.use(authContext);

router.get('/summary', getSummary);
router.get('/trends', getTrends);

module.exports = router;
