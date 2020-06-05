const mongoose = require('mongoose');
const { Schema } = mongoose;

const WallpaperSchema = new Schema({
    secuela: {type:String},
    imageURL: {type: String},
    image_id: {type: String},
    user : {type: String},
    date_add : {type: Date, default: Date.now}
});

module.exports = mongoose.model('Wallpaper', WallpaperSchema)