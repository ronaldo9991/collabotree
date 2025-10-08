// Temporary simplified app for debugging
function App() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', textAlign: 'center' }}>
        🎉 CollaboTree is Working! 🎉
      </h1>
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2>Frontend Status: ✅ Working</h2>
        <p><strong>Current URL:</strong> {window.location.href}</p>
        <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
        <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'Not set'}</p>
        
        <h3>API Test:</h3>
        <button 
          onClick={() => {
            fetch('/api/health')
              .then(res => res.json())
              .then(data => alert('✅ API Working!\n\nResponse: ' + JSON.stringify(data, null, 2)))
              .catch(err => alert('❌ API Error: ' + err.message));
          }}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Test Backend API
        </button>
        
        <h3>Next Steps:</h3>
        <ul>
          <li>✅ Frontend is working</li>
          <li>🔧 Need to set up environment variables</li>
          <li>🔧 Need to configure database</li>
          <li>🔧 Need to restore full app functionality</li>
        </ul>
      </div>
    </div>
  );
}

export default App;