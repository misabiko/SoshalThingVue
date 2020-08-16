import express, {NextFunction, Request, Response} from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import morgan from 'morgan';
import favicon from 'serve-favicon';
import passport from 'passport';
import {Twitter} from "./routes/twitter";
import * as path from 'path';

const app = express();

app.use(express.static('public'));
app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.ico')));
app.use('/index.js', express.static(path.join(__dirname, 'index.js')));
app.use('/style.css', express.static(path.join(__dirname, 'style.css')));

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
app.get('/checklogins', function(req : Request, res : Response) {
	res.json({
		Twitter: Twitter.checkLogin(),
		Mastodon: false,
		Pixiv: false,
	})
});

app.listen(3000, () => console.log('Listening at http://localhost:3000'));