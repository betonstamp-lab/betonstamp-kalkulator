import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Adatbázis feltöltése kezdődik...');

  // Natture - Alapozók
  const nattureABS = await prisma.product.create({
    data: {
      system: 'natture',
      category: 'alapozo',
      type: 'abs',
      name: 'Primacem ABS',
      info: 'Univerzális alapozó minden felületre',
      options: {
        create: [
          { kg: 1, price: 0, m2: 10 },
          { kg: 5, price: 4178, m2: 50 }
        ]
      }
    }
  });

  const natturePlusz = await prisma.product.create({
    data: {
      system: 'natture',
      category: 'alapozo',
      type: 'plusz',
      name: 'Primacem Plusz',
      info: 'Erősebb tapadás, problémás felületekre',
      options: {
        create: [
          { kg: 1, price: 7199, m2: 10 },
          { kg: 5, price: 5608, m2: 50 }
        ]
      }
    }
  });

  const nattureBarrier = await prisma.product.create({
    data: {
      system: 'natture',
      category: 'alapozo',
      type: 'barrier',
      name: 'Primapox 100 Barrier',
      info: '2 komponensű, vízálló alapozó',
      options: {
        create: [
          { kg: 5, price: 14304, m2: 10 },
          { kg: 20, price: 9520, m2: 40 }
        ]
      }
    }
  });

  const nattureGrip = await prisma.product.create({
    data: {
      system: 'natture',
      category: 'alapozo',
      type: 'grip',
      name: 'Primacem Grip',
      info: 'Tapadásfokozó adalék',
      options: {
        create: [
          { kg: 5, price: 4338, m2: 20 }
        ]
      }
    }
  });

  // Natture - Mikrocementek
  const nattureXL = await prisma.product.create({
    data: {
      system: 'natture',
      category: 'mikrocement',
      type: 'xl',
      name: 'Natture XL',
      info: 'Legnagyobb szemcse, 3 réteg',
      options: {
        create: [
          { kg: 20, price: 2347 }
        ]
      }
    }
  });

  const nattureL = await prisma.product.create({
    data: {
      system: 'natture',
      category: 'mikrocement',
      type: 'l',
      name: 'Natture L',
      info: 'Nagy szemcse, 3 réteg',
      options: {
        create: [
          { kg: 20, price: 2347 }
        ]
      }
    }
  });

  const nattureM = await prisma.product.create({
    data: {
      system: 'natture',
      category: 'mikrocement',
      type: 'm',
      name: 'Natture M',
      info: 'Közepes szemcse, 3 réteg',
      options: {
        create: [
          { kg: 18, price: 2388 }
        ]
      }
    }
  });

  const nattureS = await prisma.product.create({
    data: {
      system: 'natture',
      category: 'mikrocement',
      type: 's',
      name: 'Natture S',
      info: 'Finom szemcse, 3 réteg',
      options: {
        create: [
          { kg: 15, price: 3129 }
        ]
      }
    }
  });

  // Natture - Lakkok
  const nattureOneCoat = await prisma.product.create({
    data: {
      system: 'natture',
      category: 'lakk',
      type: 'onecoat',
      name: 'ONE Coat',
      info: 'Egyrétegű lakk, PreSealer-rel együtt használandó',
      options: {
        create: [
          { liters: 1, price: 24190, m2: 16 },
          { liters: 5, price: 23734, m2: 80 }
        ]
      }
    }
  });

  const nattureDragon = await prisma.product.create({
    data: {
      system: 'natture',
      category: 'lakk',
      type: 'dragon',
      name: 'Dragon',
      info: 'Prémium minőség, PreSealer-rel együtt használandó',
      options: {
        create: [
          { liters: 4, price: 105930, m2: 53 }
        ]
      }
    }
  });

  const nattureTop100 = await prisma.product.create({
    data: {
      system: 'natture',
      category: 'lakk',
      type: 'top100',
      name: 'TOP 100',
      info: 'Kétrétegű lakk, PreSealer nélkül',
      options: {
        create: [
          { liters: 1, price: 39360, m2: 14 },
          { liters: 5, price: 36930, m2: 71 }
        ]
      }
    }
  });

  console.log('✅ Natture termékek feltöltve!');
  console.log(`  - ${nattureABS.name}`);
  console.log(`  - ${natturePlusz.name}`);
  console.log(`  - ${nattureBarrier.name}`);
  console.log(`  - ${nattureGrip.name}`);
  console.log(`  - ${nattureXL.name}`);
  console.log(`  - ${nattureL.name}`);
  console.log(`  - ${nattureM.name}`);
  console.log(`  - ${nattureS.name}`);
  console.log(`  - ${nattureOneCoat.name}`);
  console.log(`  - ${nattureDragon.name}`);
  console.log(`  - ${nattureTop100.name}`);
  
  console.log('🎉 Adatbázis feltöltés kész!');
}

main()
  .catch((e) => {
    console.error('❌ Hiba történt:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });