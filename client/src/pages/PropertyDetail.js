import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import propertyService from '../services/propertyService';

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true);
        const data = await propertyService.getPropertyById(id);
        setProperty(data);
        setError('');
      } catch (err) {
        setError('Error al cargar la propiedad');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id]); // ✅ Ahora no hay warning

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!property) return <div>No se encontró la propiedad</div>;

  return (
    <div className="property-detail">
      <h1>{property.title}</h1>
      <img src={property.image} alt={property.title} />
      <p>{property.description}</p>
      <p><strong>Precio:</strong> ${property.price}/noche</p>
      <p><strong>Ubicación:</strong> {property.location}</p>
      <p><strong>Capacidad:</strong> {property.capacity} personas</p>
      {/* Agrega más detalles según tu modelo */}
    </div>
  );
};

export default PropertyDetail;