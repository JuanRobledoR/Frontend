import { useState, useEffect } from 'react'
import './App.css' 


function Buscador() {
  const [busqueda, setBusqueda] = useState("")
  const [resultados, setResultados] = useState([])

  useEffect(() => {
 
    if (busqueda.trim() === "") {
      setResultados([])
      return
    }

    //sEspera 500ms a quese deje de escribir
    const timer = setTimeout(() => {
      fetch(`http://localhost:8000/buscar?q=${busqueda}`)
        .then(res => res.json())
        .then(data => setResultados(data))
        .catch(err => console.error("Error:", err))
    }, 500)

    return () => clearTimeout(timer) // Limpia
  }, [busqueda])

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🎧 BeatMatch Finder</h1>
      
      <input 
        type="text" 
        placeholder="Escribe una canción (ej. Bad Bunny)..." 
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ 
          width: '100%', 
          padding: '10px', 
          fontSize: '16px',
          marginBottom: '20px'
        }}
      />

      <div className="resultados">
        {resultados.map((cancion) => (
          <div key={cancion.id} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            background: '#333', 
            padding: '10px', 
            marginBottom: '5px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            <img src={cancion.imagen} alt="cover" style={{ borderRadius: '4px'}} />
            <div>
              <div style={{ fontWeight: 'bold' }}>{cancion.titulo}</div>
              <div style={{ fontSize: '0.8em', color: '#ccc' }}>{cancion.artista}</div>
            </div>
            {/* Reproductor mini para probar */}
            <audio controls src={cancion.preview} style={{ height: '30px', marginLeft: 'auto' }}></audio>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Buscador