const { FinancialRecord, RECORD_TYPE } = require('../models/FinancialRecord');
const {buildValidationError,parseDate,parsePositiveInteger} = require('./dashboardValidation');

function buildDateMatch({ startDate, endDate } = {}) {
  if (!startDate && !endDate) {
    return {};
  }

  const date = {};

  if (startDate) {
    date.$gte = parseDate(startDate, 'startDate');
  }

  if (endDate) {
    date.$lte = parseDate(endDate, 'endDate');
  }

  if (date.$gte && date.$lte && date.$gte > date.$lte) {
    throw buildValidationError('startDate cannot be greater than endDate');
  }

  return { date };
}

async function getDashboardSummary(filters = {}) {
  const match = buildDateMatch(filters);

  const [totalsAgg, categoryAgg, recentActivity] = await Promise.all([
    FinancialRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]),
    FinancialRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            category: '$category',
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.category': 1 } },
    ]),
    FinancialRecord.find(match)
      .sort({ date: -1, createdAt: -1 })
      .limit(10)
      .populate('createdBy', 'name email role status'),
  ]);

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const item of totalsAgg) {
    if (item._id === RECORD_TYPE.INCOME) {
      totalIncome = item.total;
    }

    if (item._id === RECORD_TYPE.EXPENSE) {
      totalExpenses = item.total;
    }
  }

  const categoryMap = new Map();

  for (const row of categoryAgg) {
    const category = row._id.category;
    const type = row._id.type;
    const total = row.total;

    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        category,
        income: 0,
        expense: 0,
        net: 0,
      });
    }

    const target = categoryMap.get(category);

    if (type === RECORD_TYPE.INCOME) {
      target.income = total;
    }

    if (type === RECORD_TYPE.EXPENSE) {
      target.expense = total;
    }

    target.net = target.income - target.expense;
  }

  return {
    totals: {income: totalIncome, expenses: totalExpenses, netBalance: totalIncome - totalExpenses},
    categoryWiseTotals: Array.from(categoryMap.values()),
    recentActivity,
  };
}

function buildTrendMatch({ startDate, endDate, interval = 'monthly', lookback } = {}) {
  if (startDate || endDate) {
    return buildDateMatch({ startDate, endDate });
  }

  const now = new Date();
  const safeInterval = String(interval).trim().toLowerCase();
  const defaultLookback = safeInterval === 'weekly' ? 8 : 6;
  const safeLookback = lookback ? parsePositiveInteger(lookback, 'lookback') : defaultLookback;

  const start = new Date(now);

  if (safeInterval === 'monthly') {
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCMonth(start.getUTCMonth() - (safeLookback - 1));
    return { date: { $gte: start } };
  }

  if (safeInterval === 'weekly') {
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - safeLookback * 7);
    return { date: { $gte: start } };
  }

  throw buildValidationError('interval must be either monthly or weekly');
}

async function getTrendSeries(filters = {}) {
  const interval = String(filters.interval || 'monthly').trim().toLowerCase();
  const match = buildTrendMatch({
    startDate: filters.startDate,
    endDate: filters.endDate,
    interval,
    lookback: filters.lookback,
  });

  let groupId;

  if (interval === 'weekly') {
    groupId = {
      year: { $isoWeekYear: '$date' },
      week: { $isoWeek: '$date' },
      type: '$type',
    };
  } else if (interval === 'monthly') {
    groupId = {
      year: { $year: '$date' },
      month: { $month: '$date' },
      type: '$type',
    };
  } else {
    throw buildValidationError('interval must be either monthly or weekly');
  }

  const rows = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: groupId,
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 } },
  ]);

  const buckets = new Map();

  for (const row of rows) {
    const periodKey = interval === 'weekly'
      ? `${row._id.year}-W${String(row._id.week).padStart(2, '0')}`
      : `${row._id.year}-${String(row._id.month).padStart(2, '0')}`;

    if (!buckets.has(periodKey)) {
      buckets.set(periodKey, {period: periodKey,income: 0,expenses: 0,net: 0});
    }

    const trendPoint = buckets.get(periodKey);

    if (row._id.type === RECORD_TYPE.INCOME) {
      trendPoint.income = row.total;
    }

    if (row._id.type === RECORD_TYPE.EXPENSE) {
      trendPoint.expenses = row.total;
    }

    trendPoint.net = trendPoint.income - trendPoint.expenses;
  }

  return {interval,points: Array.from(buckets.values())};
}

module.exports = {getDashboardSummary,getTrendSeries};
