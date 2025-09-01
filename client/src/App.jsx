import React, { useEffect, useMemo, useState } from 'react'
import io from 'socket.io-client'
import TripPanel from './components/TripPanel.jsx'
import MapView from './components/MapView.jsx'
import Chat from './components/Chat.jsx'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export default function App() {
  const [code, setCode] = useState(localStorage.getItem('tripCode') || '');
  const [name, setName] = useState(localStorage.getItem('name') || '');
  const [phone, setPhone] = useState(localStorage.getItem('phone') || '');
  const [userId] = useState(() => crypto.randomUUID());
  const [members, setMembers] = useState([]);
  const [chat, setChat] = useState([]);
  const [sos, setSos] = useState([]);

  const socket = useMemo(() => io(SERVER_URL, { transports: ['websocket'] }), []);

  useEffect(() => {
    if (!code) return;
    socket.emit('join_trip', { code, user: { id: userId, name: name || 'Rider', phone } });
  }, [code]);

  useEffect(() => {
    socket.on('members', setMembers);
    socket.on('chat_message', (m) => setChat((c) => [...c, m]));
    socket.on('chat_history', (hist) => setChat(hist));
    socket.on('sos', (evt) => setSos((s) => [evt, ...s].slice(0, 10)));
    socket.on('sos_history', (hist) => setSos(hist.reverse()));
    return () => socket.off();
  }, [socket]);

  const createTrip = async (tripName, phone) => {
    const r = await fetch(SERVER_URL + '/api/trips', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: tripName }) });
    const data = await r.json();
    setCode(data.code);
    localStorage.setItem('tripCode', data.code);
  };

  const joinTrip = async (codeInput, displayName, phone) => {
    setName(displayName);
    setPhone(phone);
    localStorage.setItem('name', displayName);
    localStorage.setItem('phone', phone);
    const r = await fetch(SERVER_URL + '/api/trips/' + codeInput + '/join', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ userId, name: displayName, phone })
    });
    if (r.ok) {
      setCode(codeInput);
      localStorage.setItem('tripCode', codeInput);
      socket.emit('join_trip', { code: codeInput, user: { id: userId, name: displayName, phone } });
    } else {
      alert('Trip not found.');
    }
  };

  const sendLocation = (lat, lng) => {
    if (!code) return;
    socket.emit('location_update', { code, userId, name: name || 'Rider', lat, lng });
  };

  const sendMessage = (message) => {
    if (!code) return;
    socket.emit('chat_message', { code, userId, name: name || 'Rider', message });
  };

  const sendSOS = () => {
    if (!code) return;
    socket.emit('sos', { code, userId, name: name || 'Rider' });
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="header">🏍️ RideTogether <span className="badge">web demo</span></div>
        <TripPanel code={code} onCreate={createTrip} onJoin={joinTrip} />
        {code && (
          <div className="section">
            <div className="legend">Trip code</div>
            <div className="code">{code}</div>
          </div>
        )}

        <div className="section">
          <div className="legend">Members live</div>
          {members.map(m => (
            <div key={m.id} className="member">
              <div>👤 {m.name}</div>
              <div style={{fontSize:12, color:'#9fb3c8'}}>
                {m.lat && m.lng ? `${m.lat.toFixed(4)}, ${m.lng.toFixed(4)}` : '—'}
              </div>
              {m.phone && <a className="button" style={{padding:'4px 8px', fontSize:12}} href={`tel:${m.phone}`}>📞 Call</a>}
            </div>
          ))}
        </div>

        <div className="section">
          <Chat chat={chat} onSend={sendMessage} />
        </div>

        <div className="section">
          <button className="button sos" onClick={sendSOS}>🚨 SOS</button>
          <div className="legend" style={{marginTop:8}}>Recent SOS</div>
          <ul>
            {sos.map((s, i) => <li key={i}>🚨 {s.name} at {new Date(s.ts).toLocaleTimeString()}</li>)}
          </ul>
        </div>
      </div>

      <MapView onLocation={sendLocation} members={members} />
    </div>
  );
}
