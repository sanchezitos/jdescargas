const mongoose = require('mongoose');

mongoose.connect('', {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false
})

.then(db => console.log('base de datos conectada'))
    .catch(err => console.error(err));