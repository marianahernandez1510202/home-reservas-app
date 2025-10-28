const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Modelo de Propiedad simplificado (ajusta según tu modelo real)
const propertySchema = new mongoose.Schema({
  title: String,
  description: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  pricePerNight: Number,
  maxGuests: Number,
  bedrooms: Number,
  bathrooms: Number,
  amenities: [String],
  images: [String],
  rules: [String],
  rating: Number,
  reviewCount: Number,
  status: String,
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: Date,
  updatedAt: Date
});

const Property = mongoose.model('Property', propertySchema);

// Datos de prueba
const testProperties = [
  {
    title: 'Estudio Acogedor cerca de la Universidad',
    description: 'Hermoso estudio completamente equipado, ideal para estudiantes o visitantes.',
    address: 'Avenida Universidad 123',
    city: 'Querétaro',
    state: 'Querétaro',
    zipCode: '76000',
    country: 'México',
    pricePerNight: 500,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['WiFi', 'Cocina', 'Estacionamiento', 'Escritorio'],
    images: ['https://picsum.photos/800/600?random=1'],
    rules: ['No fumar', 'No mascotas', 'Silencio después de las 10pm'],
    rating: 4.5,
    reviewCount: 12,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Casa Moderna en el Centro de Querétaro',
    description: 'Hermosa casa de 2 recámaras en el corazón de Querétaro. Perfecta para familias.',
    address: 'Calle Centro 456',
    city: 'Querétaro',
    state: 'Querétaro',
    zipCode: '76000',
    country: 'México',
    pricePerNight: 1200,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ['WiFi', 'Cocina completa', 'Estacionamiento', 'Jardín', 'TV'],
    images: ['https://picsum.photos/800/600?random=2'],
    rules: ['No fumar', 'Mascotas permitidas', 'Check-in después de las 3pm'],
    rating: 4.8,
    reviewCount: 25,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Departamento con Vista Panorámica',
    description: 'Amplio departamento con vista a la ciudad. Excelente ubicación.',
    address: 'Boulevard Bernardo Quintana 789',
    city: 'Querétaro',
    state: 'Querétaro',
    zipCode: '76100',
    country: 'México',
    pricePerNight: 800,
    maxGuests: 3,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['WiFi', 'Cocina', 'Balcón', 'Seguridad 24/7', 'Gimnasio'],
    images: ['https://picsum.photos/800/600?random=3'],
    rules: ['No fumar', 'No fiestas', 'No mascotas'],
    rating: 4.3,
    reviewCount: 8,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Casa Campestre con Alberca',
    description: 'Preciosa casa en las afueras con alberca privada y jardín amplio.',
    address: 'Carretera a Celaya Km 5',
    city: 'Querétaro',
    state: 'Querétaro',
    zipCode: '76200',
    country: 'México',
    pricePerNight: 2500,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 3,
    amenities: ['WiFi', 'Alberca', 'Asador', 'Jardín', 'Estacionamiento para 3 autos', 'Cocina'],
    images: ['https://picsum.photos/800/600?random=4'],
    rules: ['No fumar dentro de la casa', 'Mascotas permitidas', 'Fiesta máximo 10 personas'],
    rating: 4.9,
    reviewCount: 34,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Loft Industrial en Zona Creativa',
    description: 'Moderno loft con diseño industrial, ideal para profesionales creativos.',
    address: 'Calle de los Artistas 321',
    city: 'Querétaro',
    state: 'Querétaro',
    zipCode: '76050',
    country: 'México',
    pricePerNight: 950,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['WiFi de alta velocidad', 'Escritorio grande', 'Cocina', 'Smart TV', 'Sonido surround'],
    images: ['https://picsum.photos/800/600?random=5'],
    rules: ['No fumar', 'No mascotas', 'Ideal para trabajo remoto'],
    rating: 4.7,
    reviewCount: 19,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedDatabase() {
  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/home_db_test';
    console.log('🔌 Connecting to MongoDB:', mongoUri);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');

    // Limpiar colección existente
    await Property.deleteMany({});
    console.log('🗑️  Cleared existing properties');

    // Insertar datos de prueba
    const createdProperties = await Property.insertMany(testProperties);
    console.log(`✅ Created ${createdProperties.length} test properties`);

    // Mostrar IDs creados
    console.log('\n📋 Property IDs:');
    createdProperties.forEach((prop, index) => {
      console.log(`   ${index + 1}. ${prop.title} - ID: ${prop._id}`);
    });

    console.log('\n🎉 Database seeded successfully!');
    
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('👋 Connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Ejecutar seed
seedDatabase();