const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  name: String,
  password: String,
});

userSchema.pre('save', function(next) {
  const user = this

  if (this.isModified("password") || this.isNew) {
    bcrypt.hash(user.password, 10).then(hashed => {
      user.password = hashed

      next()
    })
  } else {
    next()
  }
})

userSchema.method('checkPassword', async function(password) {
  return await bcrypt.compare(password, this.password) // TODO: error handling
})

module.exports = mongoose.model("User", userSchema)