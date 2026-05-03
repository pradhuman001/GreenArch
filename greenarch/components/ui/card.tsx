interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card Component - Container for content
 */
export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>{children}</div>
  );
}
