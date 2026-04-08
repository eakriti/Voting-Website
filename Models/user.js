const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: String,
  password: {
    type: String,
    required: true,
  },
  address: String,
  aadharCardNumber: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: String,
  role: {
    type: String,
    default: "user",
  }
});

// Hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});
// Compare password
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
