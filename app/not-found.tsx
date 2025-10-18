export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-a12 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-9 mb-4">404 - Page Not Found</h1>
        <p className="text-gray-6 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Go back home
        </a>
      </div>
    </div>
  );
}
