import { Link } from 'react-router-dom';

export default function PublicNavbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / Nazwa */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              WizytowkaSandbox
            </Link>
          </div>
          
          {/* Linki nawigacyjne */}
          <div className="flex space-x-8">
            <Link to="/menu" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md font-medium">
              Menu
            </Link>
            <Link to="/rezerwacje" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md font-medium">
              Rezerwacje
            </Link>
            <Link to="/formularz" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md font-medium">
              Kontakt
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}