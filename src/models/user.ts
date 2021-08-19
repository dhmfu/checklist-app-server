import { Schema, model, Model } from 'mongoose'

import bcrypt from "bcryptjs"

interface IUser {
  email: string;
  name: string;
  password: string;
}

const userSchema = new Schema<IUser, Model<IUser>, IUser>({
  email: { type: String, unique: true },
  name: String,
  password: String,
})

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

interface UserMethods {
  checkPassword(password: string): Promise<boolean>
}

userSchema.method('checkPassword', async function(password) {
  return await bcrypt.compare(password, this.password) // TODO: error handling
})

export const User = model<IUser, any, Model<IUser, UserMethods>>("User", userSchema)