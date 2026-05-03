export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-2">404</h1>
        <p className="text-xl text-gray-600 mb-4">Page not found</p>
        <a href="/" className="text-primary hover:text-secondary font-semibold">
          Go back home
        </a>
      </div>
    </div>
  );
}
