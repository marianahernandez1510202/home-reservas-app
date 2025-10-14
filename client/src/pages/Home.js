import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <header className="home-header">
        <h1>🏠 HOME</h1>
        <p>Encuentra el hospedaje perfecto para tu próxima aventura</p>
      </header>

      <main className="home-main">
        <div className="search-section">
          <h2>Busca tu próximo destino</h2>
          <Link to="/properties" className="btn btn-primary">
            Ver Propiedades
          </Link>
        </div>

        <div className="features">
          <div className="feature">
            <h3>🔍 Búsqueda Fácil</h3>
            <p>Encuentra propiedades por ciudad, precio y fechas</p>
          </div>
          <div className="feature">
            <h3>✨ Propiedades Verificadas</h3>
            <p>Todas nuestras propiedades están verificadas</p>
          </div>
          <div className="feature">
            <h3>💳 Pago Seguro</h3>
            <p>Transacciones seguras y protegidas</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;