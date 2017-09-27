const http = require('http');
const socketio = require('socket.io');
const fs = require('fs');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

let draws = {};

const handler = (req, res) => {
  fs.readFile(`${__dirname}/../client/index.html`, (err, data) => {
    if (err) {
      throw err;
    }

    res.writeHead(200);
    res.end(data);
  });
};

const app = http.createServer(handler);

const io = socketio(app);

app.listen(PORT);

io.on('connection', (socket) => {
  socket.join('room1');

  socket.on('draw', (data) => {
    // {name:user, coords: draws[user]}
    // draws[user] = {lastUpdate: time, x:x,y:y, width:100,height:100}

    if (!draws[data.name]) {
      draws[data.name] = data.coords;
    } else if (data.coords.lastUpdate > draws[data.name].lastUpdate) {
      draws[data.name] = data.coords;
    }

    io.sockets.in('room1').emit('updated', { name: data.name, coords: data.coords });

    const keys = Object.keys(draws);
    if (keys.length > 300) draws = {};
  });

  socket.on('disconnect', () => {
    socket.leave('room1');
  });
});

console.log(`listening on port ${PORT}`);
