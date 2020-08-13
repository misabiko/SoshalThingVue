import express, {NextFunction, Request, Response} from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import morgan from 'morgan';
import passport from 'passport';
import {Twitter} from "./routes/twitter";

const app = express();

app.use(express.static('public'));
app.use('/index.js', express.static(__dirname + '/index.js'));
app.use('/style.css', express.static(__dirname + '/style.css'));

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
	secret: 'ehyAv3bH2AwKMMWiOgOeNlOYg',
	resave: false,
	saveUninitialized: true,
	//cookie: {secure: true},	TODO Implement HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function (err : Error, req : Request, res : Response, _next : NextFunction) {
	console.error(err.stack)
	res.status(500).send('Something broke!')
})

app.use('/twitter', Twitter.router);

app.listen(3000, () => console.log('Listening at http://localhost:3000'));