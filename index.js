var express = require('express');
var app = express();

app.get('/', (req, res) => {
  res.send('Hello world');
});

app.listen(process.env.PORT || 3000);
console.log('listen in 3000');

module.exports = app;
