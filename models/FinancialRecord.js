const mongoose = require('mongoose');

const RECORD_TYPE = Object.freeze({INCOME: 'income',EXPENSE: 'expense'});

const financialRecordSchema = new mongoose.Schema({
    amount: {type: Number, required: true,min: 0},
    type: {type: String, required: true, enum: Object.values(RECORD_TYPE), lowercase: true,
      trim: true, index: true},

    category: {type: String,required: true,trim: true,lowercase: true,index: true},

    date: {
      type: Date,required: true, default: Date.now, index: true,
    },
    notes: {
      type: String, trim: true, default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

financialRecordSchema.index({ type: 1, category: 1, date: -1 });

const FinancialRecord = mongoose.model('FinancialRecord', financialRecordSchema);

module.exports = {FinancialRecord,RECORD_TYPE};
