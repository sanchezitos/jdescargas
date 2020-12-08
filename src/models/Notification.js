const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSchema = new Schema({
	action: {type: String},
    type : {type: String},
    user : {type: String},
    user_id : {type: String},
    movie : {type: String},
    movie_id : {type: String},
    search : {type: String},
    date_add : {type: Date, default: Date.now},
    view : {type: String},
    like : {type: String},
    list : {type: String},
    report : {type: String},
    suggestion : {type: String},
    movies : {type: String}
});

module.exports = mongoose.model('Notification', NotificationSchema)
