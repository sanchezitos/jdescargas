const moment = require('moment');
const helpers = {};
helpers.timeago = date_add =>{
    moment.locale('es');
  return moment(date_add).startOf('minute').fromNow();
}
module.exports = helpers;