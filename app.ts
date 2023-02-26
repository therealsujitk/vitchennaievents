import express from "express";
import apiRouter from './api';

const app = express();

app.use('/api', apiRouter);
app.use('/profile', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.redirect('/profile');
});

app.get('/profile*', (req, res) => {
  res.status(200).sendFile(__dirname + '/public/index.html');
});

app.all('/*', (req, res) => {
  res.status(404).json({
    error: 'Invalid API endpoint or request method.'
  });
});

export default app;
