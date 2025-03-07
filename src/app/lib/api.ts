// lib/api.ts

import fs from 'fs';
import path from 'path';
import { Perfume } from '@/app/types/Product'; // Asegúrate de tener definida la interface en el archivo correspondiente

export const getProducts = async (): Promise<Perfume[]> => {
  const filePath = path.join(process.cwd(), 'data', 'sampleProducts.json');
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  const products: Perfume[] = JSON.parse(jsonData);
  return products;
};
