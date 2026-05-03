import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-50 to-green-100 py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl font-bold text-green-900 mb-4">Welcome to GreenArch</h1>
            <p className="text-xl text-green-700 mb-8">
              Connect with nurseries and gardeners for all your sustainable green space needs
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/(user)/nurseries"
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Browse Nurseries
              </Link>
              <Link
                href="/(user)/gardeners"
                className="px-8 py-3 bg-white text-green-600 border-2 border-green-600 rounded-lg font-semibold hover:bg-green-50 transition"
              >
                Find Gardeners
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose GreenArch?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-lg mb-4"></div>
                <h3 className="text-xl font-bold mb-2">Wide Selection</h3>
                <p className="text-gray-600">Browse plants from multiple nurseries in your area</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-lg mb-4"></div>
                <h3 className="text-xl font-bold mb-2">Professional Gardeners</h3>
                <p className="text-gray-600">Connect with experienced gardening professionals</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-lg mb-4"></div>
                <h3 className="text-xl font-bold mb-2">Reliable Service</h3>
                <p className="text-gray-600">Vetted partners for quality and reliability</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-green-600 text-white py-12 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Green Your Space?</h2>
            <Link
              href="/(auth)/register"
              className="px-8 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
            >
              Sign Up Today
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
