const mongoose = require('mongoose');
const { Schema } = mongoose;

const DownloadSchema = new Schema({
    movie: {type:String},
    id_movie: {type: String},
    server: {type: String},
    link: {type:String},
    date_add : {type: Date, default: Date.now},
    

});

module.exports = mongoose.model('Download', DownloadSchema)