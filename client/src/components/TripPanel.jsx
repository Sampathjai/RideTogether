import React, { useState } from 'react'

export default function TripPanel({ code, onCreate, onJoin }) {
  const [name, setName] = useState(localStorage.getItem('name') || '');
  const [phone, setPhone] = useState(localStorage.getItem('phone') || '');
  const [tripName, setTripName] = useState('Saturday Cruise');
  const [joinCode, setJoinCode] = useState('');

  return (
    <div className="section">
      <div className="legend">Your name</div>
      <input className="input" placeholder="Rider name" value={name} onChange={e => setName(e.target.value)} />

      <div className="legend" style={{marginTop:12}}>Phone (optional)</div>
      <input className="input" placeholder="e.g. +1234567890" value={phone} onChange={e => setPhone(e.target.value)} />

      <div className="legend" style={{marginTop:12}}>Create new trip</div>
      <div className="row">
        <input className="input" value={tripName} onChange={e => setTripName(e.target.value)} />
        <button className="button" onClick={() => { localStorage.setItem('name', name); localStorage.setItem('phone', phone); onCreate(tripName, phone); }}>Create</button>
      </div>

      <div className="legend" style={{marginTop:12}}>Join a trip</div>
      <div className="row">
        <input className="input" placeholder="CODE" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} />
        <button className="button" onClick={() => { localStorage.setItem('name', name); localStorage.setItem('phone', phone); onJoin(joinCode, name || 'Rider', phone); }}>Join</button>
      </div>
    </div>
  )
}
