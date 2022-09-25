const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  subject: String,
  section: String,
  students: Array,
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
