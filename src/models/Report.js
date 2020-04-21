const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReportSchema = new Schema({
    user_id: {type:String},
    user_name: {type: String},
    admin_id: {type:String},
    title: {type:String},
    report: {type: String},
    date_add : {type: Date, default: Date.now}

    
});

module.exports = mongoose.model('Report', ReportSchema)