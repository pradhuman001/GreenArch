'use client';

interface ProfileInfoCardProps {
  name?: string;
  email?: string;
  phone?: string;
  onSubmit?: (data: ProfileData) => void;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
}

export function ProfileInfoCard({
  name = 'Sarah Anderson',
  email = 'sarah@example.com',
  phone = '+1 (555) 123-4567',
  onSubmit,
}: ProfileInfoCardProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: ProfileData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
    };
    onSubmit?.(data);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 border border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Information</h2>
        <p className="text-gray-600">Update your basic details used for inspections and support.</p>
      </div>

      {/* Current Info Display */}
      <div className="mb-8 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-semibold text-gray-600 block mb-1">Current Email</span>
            <span className="text-gray-900 font-medium">{email}</span>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-600 block mb-1">Current Phone</span>
            <span className="text-gray-900 font-medium">{phone}</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="profileName" className="block text-sm font-semibold text-gray-900 mb-2">
            Full Name *
          </label>
          <input
            id="profileName"
            name="name"
            type="text"
            defaultValue={name}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="profileEmail" className="block text-sm font-semibold text-gray-900 mb-2">
            Email Address *
          </label>
          <input
            id="profileEmail"
            name="email"
            type="email"
            defaultValue={email}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter your email address"
          />
        </div>

        <div>
          <label htmlFor="profilePhone" className="block text-sm font-semibold text-gray-900 mb-2">
            Phone Number *
          </label>
          <input
            id="profilePhone"
            name="phone"
            type="tel"
            defaultValue={phone}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter your phone number"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary hover:bg-secondary text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
        >
          Save Changes
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-6">
        Your information is secure and will never be shared.
      </p>
    </div>
  );
}
