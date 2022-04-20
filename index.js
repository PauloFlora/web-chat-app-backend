const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const router = require('./router');

const PORT = process.env.PORT || 4001;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

//Lista temporária de usuários
let users = []

app.use(router);

io.on('connection', async (socket) => {
  console.log( `[SOCKET] New User conected. ID: ${socket.id}`);
  //Ao fazer login, atualiza a lista de usuários e a envia para todos. 
  socket.on('login', (data) => {
    console.log('[SOCKET] User logged in =>', data);
    data.socketId = socket.id
    users.push(data);
    io.emit('login', users);
  })

  //Ao receber uma mensagem a envia para todos.
  socket.on('chat-message', (data) => {
    console.log('[SOCKET] Chat.message =>', data);
    io.emit('chat-message', data);
  })
  //Ao desconectar, remove o usuário da lista e a envia para todos.
  socket.on('disconnect', (reason) => {
    users = users.filter((u) => u.socketId !== socket.id)
    console.log( `[SOCKET] A User disconected ${reason}`);
    io.emit('login', users);
  })
});

server.listen(PORT, () => console.log(`Escutando na porta ${PORT}`));