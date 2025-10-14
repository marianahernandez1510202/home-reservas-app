import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

// Mock de React Router para evitar errores
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ children }) => <div>{children}</div>,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  Navigate: () => <div>Navigate</div>,
  useNavigate: () => jest.fn(),
}));

describe('🏠 App Component Tests', () => {
  test('CP-001: Renderiza la aplicación sin errores', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  test('CP-002: La aplicación está definida', () => {
    expect(App).toBeDefined();
  });

  test('CP-003: El componente App es una función', () => {
    expect(typeof App).toBe('function');
  });
});