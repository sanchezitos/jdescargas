const mongoose = require('mongoose');
const { Schema } = mongoose;

const JdespecialSchema = new Schema({
    title: {type:String},
    category: {type:String},
    description: {type:String},
    imageURL: {type: String},
    user : {type: String},
    date_add : {type: Date, default: Date.now}
});

module.exports = mongoose.model('Jdespecial', JdespecialSchema)
