const mongoose = require('mongoose');
const { Schema } = mongoose;
const path = require('path');

const MovieSchema = new Schema({
    filename : {type: String},
    title : {type: String, required: true},
    description : {type: String, required: true},
    duration : {type: String, required: true},
    category : {type: Array},
    audio : {type: Array},
    year : {type: String, required: true},
    date_add : {type: Date, default: Date.now},
    score : {type: String},
    link_view : {type: Array},
    link_download : {type: Array},
    trailer : {type: String},
    views : {type: Number, default: 1},
    likes : {type: Number, default: 0},
	user : {type: String}
});

MovieSchema.virtual('uniqueId')
.get(function(){
    return this.filename.replace(path.extname(this.filename),'')
})

module.exports = mongoose.model('Movie', MovieSchema)