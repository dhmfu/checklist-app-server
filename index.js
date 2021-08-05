const express = require('express')

const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')
const mongoose = require('mongoose')

const app = express()

const User = require('./models/user')

// TODO: move this somewhere else
const PORT = 3000
const MONGOOSE_URL = 'mongodb://localhost:27017/checklists'
const JWT_SECRET = 'asdjhwqpiguh[23hr[fisdnvvz,m[oiewrajkd'

const jwtGuard = expressJwt({ secret: JWT_SECRET, algorithms: ['HS256'] })

mongoose.connect(MONGOOSE_URL, { useNewUrlParser: true })

app.use(express.json())

app.use((req, res, next) => {
  // TODO: more sophisticated cors handle
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")

  next()
})

app.post('/sign-up', async (req, res) => {
  try {
    const { email, password, name } = req.body
  
    const newUser = new User({ email, password, name })
  
    await newUser.save() // TODO: error handling
  
    res.status(200).send()
  } catch (e) {
    console.log(e) // TODO: dev only
    res.status(404).send(JSON.stringify(e))
  }
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).exec() // TODO: error handling

  if (user && await user.checkPassword(password)) {
    const payload = { name: user.name, email: user.email }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '3d', subject: user._id.toString() })

    res.status(200).send(token)
  } else {
    res.status(401).send('Incorrect email or password')
  }
})

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`)
})