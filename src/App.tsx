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
          <div className="bg-admin text-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-xl mb-2">👨‍💼 Administrador</h3>
            <p className="text-sm opacity-90">admin / admin123</p>
          </div>
          <div className="bg-gestor text-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-xl mb-2">📊 Gestor</h3>
            <p className="text-sm opacity-90">gestor.malaga / gestor123</p>
          </div>
          <div className="bg-analista text-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-xl mb-2">📈 Analista</h3>
            <p className="text-sm opacity-90">analista.datos / analista123</p>
          </div>
          <div className="bg-invitado text-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-xl mb-2">👤 Invitado</h3>
            <p className="text-sm opacity-90">demo / demo123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
