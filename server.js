const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const request = require('request');
const path = require('path');
require('dotenv').config();


const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

//setting the routes
const api = require('./api')
app.use('/api', api);

//redirect to angulr all the routes
app.use(express.static(__dirname + '/dist'))


const http = require('http').Server(app);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
  console.log('user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('add-stock', (data) => {
    io.emit('newStock', {type:'new-stock', data});
  });

  socket.on('remove-stock', (val, j) => {
    io.emit('newStock', {type:'delete-stock', val, j})
  })
});

http.listen(port, () => {
  console.log('started on port ', + port);
});
