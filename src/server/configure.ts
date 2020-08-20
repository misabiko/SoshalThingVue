import {Express, NextFunction, Request, Response} from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import {Common} from './routes/common';
import {Twitter} from './routes/twitter';

export default (app : Express) => {
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

	app.use(function(err : Error, req : Request, res : Response, _next : NextFunction) {
		console.error(err.stack)
		res.status(500).send('Something broke!')
	})

	app.use('/', Common.router);
	app.use('/twitter', Twitter.router);
};