const mongoose = require('mongoose');
const { Schema } = mongoose;
const path = require('path');

const MovieSchema = new Schema({
    filename : {type: String},
    title : {type: String},
    description : {type: String},
    duration : {type: String},
    category : {type: Array},
    audio : {type: Array},
    year : {type: String},
    date_add : {type: Date, default: Date.now},
    score : {type: String},
    link_view : {type: Array},
    link_view_count : {type: Number, default: 0},
    link_download : {type: Array},
    trailer : {type: String},
    views : {type: Number, default: 1},
    likes : {type: Array},
    likecount : {type: Number, default: 0},
    addtomylist : {type: Array},
    user : {type: String},
    secuela : {type: String},
    imageURL : {type: String},
    image_id: {type: String}
});

module.exports = mongoose.model('Movie', MovieSchema)
