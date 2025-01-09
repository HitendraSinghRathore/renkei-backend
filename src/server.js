'use strict'
const express = require('express');
const config = require('./config');

const app = express();

const PORT = config.get('port');

app.use(express.json());


app.get('/healthz', function healthRouter(_,res) {
    res.status(200).json({ status: 'OK'})
});

app.get('/',function defaultRouter(_,res)  {
    res.send('Hello from the other side!')
});

app.listen(PORT, function serverSetup() {
    console.log(`....Server started on PORT: ${PORT}......`)
});
