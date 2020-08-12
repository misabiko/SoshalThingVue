import express from 'express';
import morgan from 'morgan';
import passport from 'passport';
import {Twitter} from "./routes/twitter";

const app = express();

app.use(morgan('dev'));
app.use(passport.initialize());

app.use(function (err : Error, req : Request, res : Response, next : NextFunction) {
	console.error(err.stack)
	res.status(500).send('Something broke!')
})

app.use('/twitter', Twitter.router);

app.listen(3000, () => console.log('Listening at http://localhost:3000'));