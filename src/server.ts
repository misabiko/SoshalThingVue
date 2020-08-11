import express from 'express';
import morgan from 'morgan';
import passport from 'passport';
import {Twitter} from "./routes/twitter";

const app = express();

app.use(morgan('dev'));
app.use(passport.initialize());

app.use(express.static('public'));
app.use('/index.js', express.static(__dirname + '/index.js'));
app.use('/twitter', Twitter.router);

app.listen(3000, () => console.log('Listening at http://localhost:3000'));