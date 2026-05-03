interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

/**
 * Button Component
 */
export default function Button({ children, variant = 'primary', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-secondary',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button className={`px-4 py-2 rounded font-semibold transition ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}
