const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://sanchezitos:Sistemas8@cluster0-0favj.mongodb.net/test?retryWrites=true&w=majority'
	, {
	useCreateIndex: true,
	useNewUrlParser: true,
	useFindAndModify: false
})

.then(db => console.log('base de datos conectada'))
.catch(err => console.error(err));