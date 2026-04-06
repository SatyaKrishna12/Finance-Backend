const { getDashboardSummary, getTrendSeries } = require('../services/dashboardService');

async function getSummary(req, res, next) {
  try {
    const summary = await getDashboardSummary(req.query);
    return res.status(200).json({ data: summary });
  } catch (error) {
    return next(error);
  }
}

async function getTrends(req, res, next) {
  try {
    const trends = await getTrendSeries(req.query);
    return res.status(200).json({ data: trends });
  } catch (error) {
    return next(error);
  }
}

module.exports = {getSummary,getTrends};
