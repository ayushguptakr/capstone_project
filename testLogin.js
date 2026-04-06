async function testLogin() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dev@ecoquest.edu', password: 'dev123' })
    });
    
    const data = await res.json();
    console.log("Status:", res.status);
    if(res.status === 200) {
      console.log("Role returned:", data.user.role);
    } else {
      console.log("Error data:", data);
    }
  } catch(e) {
    console.error(e);
  }
}

testLogin();
