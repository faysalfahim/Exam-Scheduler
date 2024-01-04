const mongoose = require('mongoose');
const { Schema } = mongoose;


const studentCourseSchema = new Schema({
   roll:String,
   courses: [{
      type: String
  }],
  isApproved:Boolean
});

exports.STUDENTCOURSE = mongoose.model('Courses', studentCourseSchema);