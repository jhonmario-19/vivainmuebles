import React from 'react';

const Properties = () => {
  // Ejemplo de propiedades (reemplazar con datos reales)
  const properties = [
    { id: 1, title: 'Casa moderna', price: '$200,000', location: 'Ciudad A' },
    { id: 2, title: 'Apartamento céntrico', price: '$150,000', location: 'Ciudad B' },
    { id: 3, title: 'Villa con piscina', price: '$350,000', location: 'Ciudad C' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Propiedades Disponibles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={`https://via.placeholder.com/300x200?text=${property.title}`} alt={property.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{property.title}</h2>
              <p className="text-gray-600 mb-2">{property.location}</p>
              <p className="text-blue-600 font-bold">{property.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Properties;