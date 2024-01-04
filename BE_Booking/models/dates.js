const mongoose = require('mongoose');
const { Schema } = mongoose;


const DatesSchema = new Schema({
   dates: [{
      type: String
  }]
});

exports.DATES = mongoose.model('Dates', DatesSchema);