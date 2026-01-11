import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Termékek listázása
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const system = searchParams.get('system');
    
    const where = system ? { system } : {};
    
    const products = await prisma.product.findMany({
      where,
      include: {
        options: true
      },
      orderBy: [
        { system: 'asc' },
        { category: 'asc' },
        { type: 'asc' }
      ]
    });
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Hiba a termékek lekérdezésekor:', error);
    return NextResponse.json(
      { error: 'Nem sikerült lekérdezni a termékeket' },
      { status: 500 }
    );
  }
}

// POST - Új termék létrehozása
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const product = await prisma.product.create({
      data: {
        system: body.system,
        category: body.category,
        type: body.type,
        name: body.name,
        info: body.info || null,
        options: {
          create: body.options || []
        }
      },
      include: {
        options: true
      }
    });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Hiba a termék létrehozásakor:', error);
    return NextResponse.json(
      { error: 'Nem sikerült létrehozni a terméket' },
      { status: 500 }
    );
  }
}