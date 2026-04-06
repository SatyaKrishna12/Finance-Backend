const { FinancialRecord, RECORD_TYPE } = require('../models/FinancialRecord');

function buildValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function ensureAllowedType(type) {
  if (!Object.values(RECORD_TYPE).includes(type)) {
    throw buildValidationError(`Invalid type. Allowed values: ${Object.values(RECORD_TYPE).join(', ')}`);
  }
}

function parseNumber(value, fieldName) {
  const parsedValue = Number(value);
  if (Number.isNaN(parsedValue)) {
    throw buildValidationError(`${fieldName} must be a valid number`);
  }
  return parsedValue;
}

function parseDate(value, fieldName) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    throw buildValidationError(`${fieldName} must be a valid date`);
  }
  return parsedDate;
}

function buildFilterQuery(filters = {}) {
  const query = {};

  if (filters.type) {
    const type = String(filters.type).trim().toLowerCase();
    ensureAllowedType(type);
    query.type = type;
  }

  if (filters.category) {
    query.category = String(filters.category).trim().toLowerCase();
  }

  if (filters.startDate || filters.endDate) {
    query.date = {};
  }

  if (filters.startDate) {
    query.date.$gte = parseDate(filters.startDate, 'startDate');
  }

  if (filters.endDate) {
    query.date.$lte = parseDate(filters.endDate, 'endDate');
  }

  if (query.date && query.date.$gte && query.date.$lte && query.date.$gte > query.date.$lte) {
    throw buildValidationError('startDate cannot be greater than endDate');
  }

  if (filters.minAmount !== undefined && filters.minAmount !== '') {
    query.amount = query.amount || {};
    query.amount.$gte = parseNumber(filters.minAmount, 'minAmount');
  }

  if (filters.maxAmount !== undefined && filters.maxAmount !== '') {
    query.amount = query.amount || {};
    query.amount.$lte = parseNumber(filters.maxAmount, 'maxAmount');
  }

  return query;
}

async function listRecords(filters = {}) {
  const query = buildFilterQuery(filters);
  return FinancialRecord.find(query).sort({ date: -1, createdAt: -1 }).populate('createdBy', 'name email role status');
}

async function getRecordById(recordId) {
  return FinancialRecord.findById(recordId).populate('createdBy', 'name email role status');
}

async function createRecord({ amount, type, category, date, notes, createdBy }) {
  if (amount === undefined || type === undefined || !category) {
    throw buildValidationError('amount, type and category are required');
  }

  const numericAmount = parseNumber(amount, 'amount');
  if (numericAmount <= 0) {
    throw buildValidationError('amount must be greater than 0');
  }

  const normalizedType = String(type).trim().toLowerCase();
  ensureAllowedType(normalizedType);

  const normalizedCategory = String(category).trim().toLowerCase();
  if (!normalizedCategory) {
    throw buildValidationError('category cannot be empty');
  }

  const record = new FinancialRecord({
    amount: numericAmount,
    type: normalizedType,
    category: normalizedCategory,
    date: date ? parseDate(date, 'date') : undefined,
    notes: notes ? String(notes).trim() : '',
    createdBy,
  });

  const savedRecord = await record.save();
  await savedRecord.populate('createdBy', 'name email role status');
  return savedRecord;
}

async function updateRecord(recordId, updates) {
  if (!updates || Object.keys(updates).length === 0) {
    throw buildValidationError('At least one field must be provided for update');
  }

  const record = await FinancialRecord.findById(recordId);
  if (!record) {
    const error = new Error('Record not found');
    error.statusCode = 404;
    throw error;
  }

  if (updates.amount !== undefined) {
    const amount = parseNumber(updates.amount, 'amount');
    if (amount <= 0) {
      throw buildValidationError('amount must be greater than 0');
    }
    record.amount = amount;
  }

  if (updates.type !== undefined) {
    const normalizedType = String(updates.type).trim().toLowerCase();
    ensureAllowedType(normalizedType);
    record.type = normalizedType;
  }

  if (updates.category !== undefined) {
    const category = String(updates.category).trim().toLowerCase();
    if (!category) {
      throw buildValidationError('category cannot be empty');
    }
    record.category = category;
  }

  if (updates.date !== undefined) {
    record.date = parseDate(updates.date, 'date');
  }

  if (updates.notes !== undefined) {
    record.notes = String(updates.notes).trim();
  }

  const savedRecord = await record.save();
  await savedRecord.populate('createdBy', 'name email role status');
  return savedRecord;
}

async function deleteRecord(recordId) {
  const deletedRecord = await FinancialRecord.findByIdAndDelete(recordId).populate('createdBy', 'name email role status');
  if (!deletedRecord) {
    const error = new Error('Record not found');
    error.statusCode = 404;
    throw error;
  }

  return deletedRecord;
}

module.exports = {RECORD_TYPE,listRecords,getRecordById,createRecord,updateRecord,deleteRecord};
