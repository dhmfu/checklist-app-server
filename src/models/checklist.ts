import { Schema, model } from 'mongoose'

interface IChecklist {
  name: string,
  questions: {
    checked: boolean,
    term: string
  }[],
  userId: string
}

const checklistSchema = new Schema<IChecklist>({
  name: String,
  questions: [{ checked: Boolean, term: String, _id: false }],
  userId: String
})

export const Checklist = model<IChecklist>("Checklist", checklistSchema)