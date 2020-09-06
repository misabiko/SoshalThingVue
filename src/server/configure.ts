import {Express, NextFunction, Request, Response} from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import connectMemoryStore from 'memorystore';
import passport from 'passport';
import {Common} from './routes/common';
import {Twitter} from './routes/twitter';

export default async (app : Express) => {
	const MemoryStore = connectMemoryStore(session);

	app.use(morgan('dev'));
	app.use(cookieParser());
	app.use(bodyParser.json());
	app.use(session({
		cookie: {maxAge: 86400000},
		store: new MemoryStore({
			checkPeriod: 86400000,
		}),
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
	await Twitter.getRouter()
		.then(router => app.use('/twitter', router))
		.catch(e => console.error("Failed to initialize Twitter's proxy.", e));
};