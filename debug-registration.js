// Debug script to test registration endpoint
// Run this with: node debug-registration.js

const testRegistration = async () => {
  // Get the Railway URL from the logs you provided
  // You'll need to replace this with your actual Railway URL
  const RAILWAY_URL = 'https://your-railway-app.up.railway.app'; // Replace with actual URL
  
  const testData = {
    email: 'test@example.com',
    password: 'TestPassword123',
    name: 'Test User',
    username: 'testuser123',
    role: 'BUYER',
    bio: 'Test bio'
  };

  console.log('🧪 Testing registration endpoint...');
  console.log('📡 URL:', `${RAILWAY_URL}/api/auth/register`);
  console.log('📦 Data:', JSON.stringify(testData, null, 2));

  try {
    const response = await fetch(`${RAILWAY_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const responseData = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('✅ Registration successful!');
    } else {
      console.log('❌ Registration failed:', responseData.error || responseData.message);
    }
  } catch (error) {
    console.error('💥 Network error:', error.message);
  }
};

// Instructions for the user
console.log(`
🔧 Registration Debug Script
============================

To use this script:

1. First, find your Railway app URL from your Railway dashboard
2. Replace 'https://your-railway-app.up.railway.app' with your actual URL
3. Run: node debug-registration.js

This will test the registration endpoint and show you exactly what's happening.

Alternatively, you can test directly in your browser's developer console:

1. Open your website in the browser
2. Press F12 to open Developer Tools
3. Go to the Console tab
4. Paste this code and press Enter:

fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'TestPassword123',
    name: 'Test User',
    username: 'testuser123',
    role: 'BUYER'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);

This will show you the exact error message from the server.
`);

// Uncomment the line below to run the test (after setting the correct URL)
// testRegistration();
