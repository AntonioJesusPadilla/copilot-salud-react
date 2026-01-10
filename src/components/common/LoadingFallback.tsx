// Componente de carga para usar con React.Suspense

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        {/* Spinner animado */}
        <div className="inline-block">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Texto */}
        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
          Cargando...
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Por favor espera un momento
        </p>
      </div>
    </div>
  );
}

export default LoadingFallback;
