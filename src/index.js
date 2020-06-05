const express = require('express');
const path = require('path');
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const morgan = require('morgan');
const multer = require('multer');
//Initializations
const app = express();
require('./database');
require('./config/passport');

//Settings
app.set('port', 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
	handlebars: allowInsecurePrototypeAccess(Handlebars),
	defaultLayout: 'index',
	layoutsDir: path.join(app.get('views'), 'layouts'),
	partialsDir: path.join(app.get('views'), 'partials'),
	extname: '.hbs',
	helpers: require('./helpers/time')
	
}));
app.set('view engine','.hbs');
//Middlewares
app.use(morgan('dev'));
app.use(multer({dest: path.join(__dirname, '/public/upload/temp')}).single('image'))
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session({
	secret: 'app',
	resave: true,
	saveUninitilized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Global variables
app.use((req, res, next) => {
	res.locals.succes_msg = req.flash('succes_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.show = req.flash('show');
	res.locals.user = req.user || null ;
	res.locals.all = req.all || null ;
	next();
});

//routes
app.use(require('./routes/posts'));
app.use(require('./routes/index'));
app.use(require('./routes/notes'));
app.use(require('./routes/users'));
app.use(require('./routes/movies'));
app.use(require('./routes/wallpapers'));
app.use(require('./routes/jdespeciales'));



//Static Files
app.use(express.static(path.join(__dirname,'public')));
//Server is listening
app.listen(app.get('port'), () =>{
	console.log('server on port', app.get('port'));

});
