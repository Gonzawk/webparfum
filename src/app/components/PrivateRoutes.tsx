// src/components/PrivateRoutes.tsx
// src/components/PrivateRoutes.tsx
'use client';

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/app/context/AuthContext';

interface PrivateRoutesProps {
  children: React.ReactNode;
}

const PrivateRoutes: React.FC<PrivateRoutesProps> = ({ children }) => {
  const { tokenPayload } = useContext(AuthContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Esperamos a que tokenPayload sea distinto de undefined (puede ser null o un objeto)
    if (tokenPayload === undefined) {
      // Aún no se ha cargado el token, no hacemos nada.
      return;
    }
    setLoading(false);
    // Si no hay token o el rol no es Admin/Superadmin, redirigimos
    if (!tokenPayload || (tokenPayload.role !== 'Admin' && tokenPayload.role !== 'Superadmin')) {
      router.push('/login');
    }
  }, [tokenPayload, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default PrivateRoutes;
