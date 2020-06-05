const mongoose = require('mongoose');
const { Schema } = mongoose;

const SuggestionSchema = new Schema({
    user: {type: String},
    email: {type:String},
    suggestion: {type: String},
    state: {type: String},
    date_add : {type: Date, default: Date.now},
    state : {type: String}

});

module.exports = mongoose.model('Suggestion', SuggestionSchema)
