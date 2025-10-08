export default function TestPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>CollaboTree Test Page</h1>
      <p>If you can see this, the React app is working!</p>
      <p>Current URL: {window.location.href}</p>
      <p>API URL: {import.meta.env.VITE_API_URL || 'Not set'}</p>
      <button 
        onClick={() => {
          fetch('/api/health')
            .then(res => res.json())
            .then(data => alert('API Response: ' + JSON.stringify(data)))
            .catch(err => alert('API Error: ' + err.message));
        }}
      >
        Test API Connection
      </button>
    </div>
  );
}
