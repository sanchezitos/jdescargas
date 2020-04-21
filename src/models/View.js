const mongoose = require('mongoose');
const { Schema } = mongoose;

const ViewSchema = new Schema({
    movie: {type:String},
    id_movie: {type: String},
    server: {type: String},
    link: {type:String},
    date_add : {type: Date, default: Date.now},
    count_link_view : {type: Number, default: 0}

});

module.exports = mongoose.model('View', ViewSchema)