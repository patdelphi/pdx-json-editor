import { useState } from 'react';
import './App.css';

function App() {
  const [content, setContent] = useState('{"test": "Hello World"}');

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'white', color: '#1f2937' }}>
      {/* Header */}
      <header style={{ height: '48px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: '600' }}>JSON Editor</h1>
      </header>

      {/* Debug Info */}
      <div style={{ padding: '8px', backgroundColor: '#f3f4f6', fontSize: '12px' }}>
        <div>Content: "{content}"</div>
        <div>Length: {content.length}</div>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, padding: '16px' }}>
          <div style={{ width: '100%', height: '100%', border: '1px solid #d1d5db', borderRadius: '8px' }}>
            <textarea 
              style={{ 
                width: '100%', 
                height: '100%', 
                padding: '16px', 
                resize: 'none', 
                border: 'none', 
                outline: 'none',
                fontFamily: 'monospace'
              }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter JSON here..."
            />
          </div>
        </div>
      </main>

      {/* Status Bar */}
      <footer style={{ height: '24px', backgroundColor: '#f3f4f6', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: '12px', color: '#6b7280' }}>
        <span>Characters: {content.length}</span>
      </footer>
    </div>
  );
}

export default App;