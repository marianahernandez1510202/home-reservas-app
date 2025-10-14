module.exports = {
  testEnvironment: 'jsdom',
  
  // Permitir que Jest procese axios como módulo ES6
  transformIgnorePatterns: [
    'node_modules/(?!(axios)/)'
  ],
  
  // Mapear axios a su versión CommonJS
  moduleNameMapper: {
    '^axios$': 'axios/dist/node/axios.cjs',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  
  // Archivo de configuración inicial
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
    '!src/setupTests.js'
  ],
  
  // Evitar errores con imports de archivos estáticos
  moduleFileExtensions: ['js', 'jsx', 'json'],
  
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx}'
  ]
};