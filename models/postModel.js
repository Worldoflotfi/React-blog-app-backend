// const { Timestamp } = require('mongodb')
const {Schema, model} = require('mongoose')

const postSchema = new Schema({
    title: {type: String, required: true},
    category: {type: String,
      enum: ['Agrigulture', 'Business', 'Education', 'Entertainment', 'Art', 'Investment', 'Uncategorizes', 'Weather'], message: '{VALUE IS NOT SUPPORTED}'},
    desc: {type: String, required: true},
    creator: {type: Schema.Types.ObjectId, ref: "User"},
    title: {type: String, required: true},
}, {timestamps: true})

module.exports = model('Post', postSchema)