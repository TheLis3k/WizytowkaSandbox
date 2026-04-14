import { useMenu } from '../../hooks/useMenu';

export default function MenuPage() {
  const { data: menuItems, isLoading, isError, error } = useMenu();

  if (isLoading) {
    return <div className="text-center text-gray-500 py-10 text-xl">Ładowanie menu...</div>;
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-10">
        Wystąpił błąd podczas pobierania menu: {error.message}
      </div>
    );
  }

  if (!menuItems || menuItems.length === 0) {
    return <div className="text-center text-gray-500 py-10">Brak pozycji w menu.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nasze Menu</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 flex flex-col">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                Brak zdjęcia
              </div>
            )}
            
            <div className="p-4 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold text-gray-800">{item.name}</h2>
                <span className="text-lg font-bold text-green-600">{item.price} zł</span>
              </div>
              <p className="text-gray-600 text-sm mb-4 flex-grow">{item.description}</p>
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full w-max">
                {item.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}