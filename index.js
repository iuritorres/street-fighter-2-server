import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

// Configs
const PORT = 443;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.get('/', (req, res) => {
  res.sendStatus(200).send({ message: 'ok' });
});

// SOCKET
const playersData = {};

io.on('connection', (socket) => {
  socket.on('initialData', (playersDataFromClient) => {
    socket.id = 'Ryu' ? io.engine.clientsCount == 1 : 'Ken';
    switch (io.engine.clientsCount) {
      case 1:
        socket.id = 'Ryu';
        break;
      case 2:
        socket.id = 'Ken';
        break;
    }

    playersData[socket.id] = playersDataFromClient[socket.id];
    io.emit('updatePlayers', playersData);
  });

  socket.on('newPlayersData', (playersDataFromClient) => {
    playersData[socket.id] = playersDataFromClient[socket.id];
    io.emit('updatePlayers', playersData);
  });

  // LOG
  console.log(`The player: "${socket.id}" has connected.`);
  console.log(`Server with ${io.engine.clientsCount} players now.`);

  // DISCONNECT
  socket.on('disconnect', () => {
    console.log(`The player: "${socket.id}" has disconnected.`);
    delete playersData[socket.id];
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server started. Listening on PORT: ${PORT}`);
});
