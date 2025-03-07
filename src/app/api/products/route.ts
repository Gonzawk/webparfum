// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { getProducts } from '@/app/lib/api';

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}
