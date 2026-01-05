import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Copilot Salud Andalucía
        </h1>
        <p className="text-secondary text-lg">
          Migración a React + TypeScript en progreso...
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-medico text-white p-6 rounded-lg shadow">
            <h3 className="font-bold">Médico</h3>
          </div>
          <div className="bg-enfermero text-white p-6 rounded-lg shadow">
            <h3 className="font-bold">Enfermero</h3>
          </div>
          <div className="bg-admin text-white p-6 rounded-lg shadow">
            <h3 className="font-bold">Administrador</h3>
          </div>
          <div className="bg-paciente text-white p-6 rounded-lg shadow">
            <h3 className="font-bold">Paciente</h3>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
