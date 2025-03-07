// src/types/Product.ts
export interface Perfume {
    perfumeId: number;
    marcaId: number;
    marca?: string; // Nueva propiedad para la marca (nombre)
    modelo: string;
    precioMinorista: number;
    precioMayorista: number;
    genero: string;
    descripcion?: string;
    volumen: number;
    stock: number;
    imagenUrl ?: string;
  }
  