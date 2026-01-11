import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - CSV import árak frissítéséhez
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body; // Array of {system, type, optionKg, optionLiters, newPrice}
    
    let updatedCount = 0;
    const errors: string[] = [];
    
    for (const update of updates) {
      try {
        // Keressük meg a terméket
        const product = await prisma.product.findFirst({
          where: {
            system: update.system,
            type: update.type
          },
          include: {
            options: true
          }
        });
        
        if (!product) {
          errors.push(`Termék nem található: ${update.system} - ${update.type}`);
          continue;
        }
        
        // Keressük meg az opciót
        const option = product.options.find(opt => {
          if (update.optionKg) {
            return opt.kg === update.optionKg;
          }
          if (update.optionLiters) {
            return opt.liters === update.optionLiters;
          }
          return false;
        });
        
        if (!option) {
          errors.push(`Opció nem található: ${update.system} - ${update.type} (${update.optionKg || update.optionLiters})`);
          continue;
        }
        
        // Frissítsük az árat
        await prisma.productOption.update({
          where: { id: option.id },
          data: { price: update.newPrice }
        });
        
        updatedCount++;
      } catch (err) {
        errors.push(`Hiba: ${update.system} - ${update.type}: ${err}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      updatedCount,
      errors: errors.length > 0 ? errors : null
    });
    
  } catch (error) {
    console.error('Hiba az import során:', error);
    return NextResponse.json(
      { error: 'Nem sikerült importálni az árakat' },
      { status: 500 }
    );
  }
}