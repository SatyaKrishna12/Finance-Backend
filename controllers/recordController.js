const {listRecords,getRecordById,createRecord,updateRecord,deleteRecord} = require('../services/recordService');

async function getRecords(req, res, next) {
  try {
    const records = await listRecords(req.query);
    return res.status(200).json({ data: records });
  } catch (error) {
    return next(error);
  }
}

async function getRecord(req, res, next) {
  try {
    const record = await getRecordById(req.params.recordId);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    return res.status(200).json({ data: record });
  } catch (error) {
    return next(error);
  }
}

async function createRecordHandler(req, res, next) {
  try {
    const record = await createRecord({
      amount: req.body.amount,
      type: req.body.type,
      category: req.body.category,
      date: req.body.date,
      notes: req.body.notes,
      createdBy: req.user._id,
    });

    return res.status(201).json({ data: record });
  } catch (error) {
    return next(error);
  }
}

async function updateRecordHandler(req, res, next) {
  try {
    const updates = {};

    if (req.body.amount !== undefined) {
      updates.amount = req.body.amount;
    }

    if (req.body.type !== undefined) {
      updates.type = req.body.type;
    }

    if (req.body.category !== undefined) {
      updates.category = req.body.category;
    }

    if (req.body.date !== undefined) {
      updates.date = req.body.date;
    }

    if (req.body.notes !== undefined) {
      updates.notes = req.body.notes;
    }

    const record = await updateRecord(req.params.recordId, updates);
    return res.status(200).json({ data: record });
  } catch (error) {
    return next(error);
  }
}

async function deleteRecordHandler(req, res, next) {
  try {
    const deletedRecord = await deleteRecord(req.params.recordId);
    return res.status(200).json({ data: deletedRecord });
  } catch (error) {
    return next(error);
  }
}

module.exports = {getRecords,getRecord,createRecordHandler,updateRecordHandler,deleteRecordHandler
};
