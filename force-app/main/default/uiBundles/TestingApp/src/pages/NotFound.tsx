import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className="flex-1 h-full flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md w-full">

        {/* Icon / Visual */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-blue-100">
            <span className="text-3xl font-bold text-blue-600">!</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-6xl font-extrabold text-gray-900 mb-2 tracking-tight">
          404
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-600 mb-6">
          Oops! The page you're looking for doesn’t exist.
        </p>

        {/* Action */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 hover:shadow-md transition-all"
        >
          ← Back to Home
        </Link>

        {/* Optional hint */}
        <p className="text-sm text-gray-400 mt-6">
          If you believe this is an error, contact support.
        </p>
      </div>
    </div>
  );
}