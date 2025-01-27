'use strict';
const { Server } = require('socket.io');
const config = require('../config');
const { SOCKET_EVENTS } = require('../utils/constants');
const User = require('../models/user');
const Project = require('../models/project');
let io;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: config.get('uiDomain'),
      methods: ['GET', 'POST'],
    },
  });
  io.on('connection', function socketConnection(socket) {
    console.log('Socket connection established');

    socket.on(
      SOCKET_EVENTS.JOIN_PROJECT,
      async function joinHandler(data, callback) {
        console.log('Joining project');
        try {
          const { userId, projectId } = data;
          if (!projectId || !userId) {
            throw new Error('Missing projectId or userId');
          }
          const [userDoc, projectDoc] = await Promise.all([
            User.findById(userId),
            Project.findById(projectId),
          ]);
          if (!userDoc) {
            throw new Error('User not found');
          }
          if (!projectDoc) {
            throw new Error('Project not found');
          }
          const ownerId = projectDoc.owner.toString();
          let hasAccess = false;
          if (ownerId === userId) {
            hasAccess = true;
          } else {
            const collab = projectDoc.collaborators.find(
              (c) => c.user.toString() === userId
            );
            if (collab) {
              hasAccess = true;
            }
          }
          if (!hasAccess) {
            throw new Error('User does not have access to this project');
          }
          // user has access to the project, join the project room
          const roomName = `project:${projectId}`;
          socket.join(roomName);
          console.log(`Socket ${socket.id} joined room: ${roomName}`);
          socket.user = {
            id: userId,
            name: userDoc.name,
            email: userDoc.email,
          };
          socket.projectId = projectId;
          const updatedSocketIds = await io.in(roomName).allSockets();
          const updatedActiveUsers = [];
          const uniqueUsers = new Set();
          for (const sid of updatedSocketIds) {
            const s = io.sockets.sockets.get(sid);
            if (s && s.user) {
              if (!uniqueUsers.has(s.user.id)) {
                uniqueUsers.add(s.user.id);
                updatedActiveUsers.push({
                  id: s.user.id,
                  name: s.user.name,
                  email: s.user.email,
                });
              }
            }
          }
          socket.emit(SOCKET_EVENTS.ACTIVE_USERS, updatedActiveUsers);
          socket
            .to(roomName)
            .emit(SOCKET_EVENTS.ACTIVE_USERS, updatedActiveUsers);
          callback({
            msg: `User successfully joined project ${projectId}`,
            status: 'success',
          });
        } catch (err) {
          console.error('Error occurred in joinHandler socket event', err);
          callback({error: err.message, status: 'error'});
        }
      }
    );

    socket.on('disconnect', async function socketDisconnect() {
      console.log('Socket disconnected');
      const projectId = socket.projectId;
      if (projectId) {
        const roomName = `project:${projectId}`;
        const socketIds = await io.in(roomName).allSockets();
        const updatedActiveUsers = [];
        const uniqueUsers = new Set();
        for (const sid of socketIds) {
          const s = io.sockets.sockets.get(sid);
          if (s && s.user) {
            if (!uniqueUsers.has(s.user.id)) {
                uniqueUsers.add(s.user.id);
                updatedActiveUsers.push({
                    id: s.user.id,
                    name: s.user.name,
                    email: s.user.email,
                  });
            }
          }
        }
        socket
          .to(roomName)
          .emit(SOCKET_EVENTS.ACTIVE_USERS, updatedActiveUsers);
      }
    });
  });
}

function getIO() {
  if (!io) throw Error('Socket.io not initialized!');
  return io;
}
module.exports = {
  initSocket,
  getIO,
};
