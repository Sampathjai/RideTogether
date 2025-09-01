import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { customAlphabet } from 'nanoid';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET','POST'] }
});

const trips = new Map();
const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

function makeTrip(name) {
  const code = nanoid();
  const trip = { code, name: name || 'Ride', createdAt: Date.now(), members: new Map(), chat: [], sos: [] };
  trips.set(code, trip);
  return trip;
}

function publicTrip(trip) {
  return {
    code: trip.code,
    name: trip.name,
    createdAt: trip.createdAt,
    members: Array.from(trip.members.values()).map(m => ({
      id: m.id, name: m.name, lat: m.lat, lng: m.lng, phone: m.phone, updatedAt: m.updatedAt
    })),
    chat: trip.chat.slice(-50),
    sos: trip.sos.slice(-10)
  };
}

app.post('/api/trips', (req,res) => {
  const { name } = req.body || {};
  const trip = makeTrip(name);
  res.json({ code: trip.code, name: trip.name });
});

app.get('/api/trips/:code', (req,res) => {
  const trip = trips.get(req.params.code);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  res.json(publicTrip(trip));
});

app.post('/api/trips/:code/join', (req,res) => {
  const trip = trips.get(req.params.code);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  const { userId, name, phone } = req.body || {};
  if (!userId || !name) return res.status(400).json({ error: 'userId and name required' });
  if (!trip.members.has(userId)) {
    trip.members.set(userId, { id: userId, name, lat: null, lng: null, phone, updatedAt: null });
    io.to(trip.code).emit('members', publicTrip(trip).members);
  }
  res.json({ ok: true, trip: publicTrip(trip) });
});

io.on('connection', (socket) => {
  socket.on('join_trip', ({ code, user }) => {
    const trip = trips.get(code);
    if (!trip) {
      socket.emit('error_msg', 'Trip not found');
      return;
    }
    socket.join(code);
    if (user && user.id && user.name && !trip.members.has(user.id)) {
      trip.members.set(user.id, { id: user.id, name: user.name, lat: null, lng: null, phone: user.phone, updatedAt: null });
    }
    io.to(code).emit('members', publicTrip(trip).members);
    socket.emit('chat_history', trip.chat.slice(-50));
    socket.emit('sos_history', trip.sos.slice(-10));
  });

  socket.on('location_update', ({ code, userId, name, lat, lng }) => {
    const trip = trips.get(code);
    if (!trip) return;
    const existing = trip.members.get(userId) || { id: userId, name };
    existing.name = name || existing.name;
    existing.lat = lat;
    existing.lng = lng;
    existing.updatedAt = Date.now();
    trip.members.set(userId, existing);
    io.to(code).emit('members', publicTrip(trip).members);
  });

  socket.on('chat_message', ({ code, userId, name, message }) => {
    const trip = trips.get(code);
    if (!trip) return;
    const msg = { id: userId, name, message, ts: Date.now() };
    trip.chat.push(msg);
    io.to(code).emit('chat_message', msg);
  });

  socket.on('sos', ({ code, userId, name }) => {
    const trip = trips.get(code);
    if (!trip) return;
    const evt = { id: userId, name, ts: Date.now() };
    trip.sos.push(evt);
    io.to(code).emit('sos', evt);
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log('RideTogether server listening on http://localhost:' + PORT);
});
