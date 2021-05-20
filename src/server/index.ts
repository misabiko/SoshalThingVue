import express from 'express';
import configure from './configure';
import path from "path";
import favicon from 'serve-favicon';

const app = express();
const port = process.env.PORT || 5000;
const icoPath = path.join(__dirname, '..', 'public', 'favicon.ico');

app.use(express.static('public'));
app.use(favicon(icoPath));
app.use('/index.js', express.static(path.join(__dirname, 'index.js')));
app.use('/style.css', express.static(path.join(__dirname, 'style.css')));

configure(app).then(() => app.listen(port, () => console.log(`Listening at http://localhost:${port}`)));