const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  email: { 
    type: String, required: true, unique: true 
  },
  password: { 
    type: String, required: true 
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'educationalInstitution', 'employer'],
    required: true
  }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("user", userSchema);