const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
	useCreateIndex: true,
	useNewUrlParser: true,
	useFindAndModify: false
})

.then(db => console.log('base de datos conectada'))
.catch(err => console.error(err));