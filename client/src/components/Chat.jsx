import React, { useRef, useState } from 'react'

export default function Chat({ chat, onSend }) {
  const [text, setText] = useState('');
  const logRef = useRef(null);

  const handleSend = () => {
    if (text.trim().length === 0) return;
    onSend(text.trim());
    setText('');
    setTimeout(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 0);
  };

  return (
    <div className="chat">
      <div className="legend">Group chat</div>
      <div ref={logRef} className="chatlog">
        {chat.map((m, i) => (
          <div key={i}>
            <span style={{opacity:.8}}>{new Date(m.ts).toLocaleTimeString()} • </span>
            <b>{m.name}:</b> {m.message}
          </div>
        ))}
      </div>
      <div className="row">
        <input className="input" placeholder="Type a message" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSend()} />
        <button className="button" onClick={handleSend}>Send</button>
      </div>
    </div>
  )
}
