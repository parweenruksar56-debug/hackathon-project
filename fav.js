fetch('http://localhost:5000/api/favorites', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ asteroidId: 'Ast-2024-A' })
})
.then(res => res.json())
.then(data => console.log(data.message));