const express = require('express')

const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')
const mongoose = require('mongoose')

const app = express()

const User = require('./models/user')
const Checklist = require('./models/checklist')

const PORT = process.env.PORT || 3000
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/checklists'
const JWT_SECRET = process.env.JWT_SECRET || 'asdjhwqpiguh[23hr[fisdnvvz,m[oiewrajkd'

const jwtGuard = expressJwt({ secret: JWT_SECRET, algorithms: ['HS256'] })

mongoose.connect(MONGO_URL, { useNewUrlParser: true })

app.use(express.json())

app.use((req, res, next) => {
  // TODO: more sophisticated cors handle
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE")

  next()
})

app.post('/sign-up', async (req, res) => {
  try {
    const { email, password, name } = req.body
  
    const newUser = new User({ email, password, name })
  
    await newUser.save() // TODO: error handling
  
    res.status(201).send()
  } catch (error) {
    console.log(error) // TODO: dev only
    let errorMessage = 'Not found', statusCode = 404

    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      errorMessage = 'duplicatedEmail'
      statusCode = 400
    }

    res.status(statusCode).send(errorMessage)
  }
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }) // TODO: error handling

  if (user && await user.checkPassword(password)) {
    const payload = { name: user.name }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '3d', subject: user._id.toString() })

    res.status(200).send(token)
  } else {
    res.status(401).send('incorrectCredentials')
  }
})

app.post('/checklists', jwtGuard, async (req, res) => {
  const checklistData = req.body
  const userId = req.user.sub // from jwtGuard

  try {
    const { name, questions } = checklistData

    const questionsMapped = questions.map(question => ({ checked: false, term: question }))
  
    const dbChecklist = await new Checklist({ name, questions: questionsMapped, userId }).save() // TODO: error handling
  
    res.status(201).send({ name: dbChecklist.name, questions: dbChecklist.questions, id: dbChecklist._id.toString() })
  } catch (e) {
    console.log(e) // TODO: dev only
    res.status(404).send(JSON.stringify(e))
  }
})

app.get('/checklists', jwtGuard, async (req, res) => {
  const userId = req.user.sub // from jwtGuard

  if (!userId) {
    res.status(404).send('No user id provided')

    return
  }

  try {
    const checklists = (await Checklist.find({ userId })).map(({ _id, name, questions }) => {
      return ({ id: _id, name, questions})
    }) // TODO: error handling
  
    res.status(200).send(checklists)
  } catch (e) {
    console.log(e) // TODO: dev only
    res.status(404).send(JSON.stringify(e))
  }
})

app.delete('/checklists/:checklistId', jwtGuard, async (req, res) => {
  const checklistId = req.params.checklistId

  if (!checklistId) {
    res.status(404).send('No checklist id provided')

    return
  }

  try {
    await Checklist.findOneAndDelete({ _id: checklistId }) // TODO: error handling
  
    res.status(200).send()
  } catch (e) {
    console.log(e) // TODO: dev only
    res.status(404).send(JSON.stringify(e))
  }
})

app.put('/checklists/:checklistId', jwtGuard, async (req, res) => {
  const checklistId = req.params.checklistId

  if (!checklistId) {
    res.status(404).send('No checklist id provided')

    return
  }

  const questions = req.body

  try {
    await Checklist.updateOne({ _id: checklistId }, { questions }) // TODO: error handling
  
    res.status(200).send()
  } catch (e) {
    console.log(e) // TODO: dev only
    res.status(404).send(JSON.stringify(e))
  }
})

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`)
})