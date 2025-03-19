// app/page.tsx
import React from 'react';
import Link from 'next/link';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Bienvenido a Pefumes Importados</h1>
      <Link href="/inicio" className="mt-4 text-lg">
        Visita nuestro sitio web
      </Link>
    </div>
  );
};

export default HomePage;
