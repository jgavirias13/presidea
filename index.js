
var express = require('express');
var app = express();

app.get('/', (req, res) => {
  res.send('Hello world');
});

let port = process.env.PORT || 3000;

app.listen(port);
console.log(`listen in ${port}`);

module.exports = app;
