import { SystemProducts } from '@/types';

export const PRODUCTS: Record<string, SystemProducts> = {
  natture: {
    name: 'Natture',
    alapozok: {
      abs: { 
        name: 'Primacem ABS', 
        options: [
          { kg: 1, price: 0, m2: 10 },
          { kg: 5, price: 4178, m2: 50 }
        ],
        info: 'Univerzális alapozó minden felületre'
      },
      plusz: { 
        name: 'Primacem Plusz', 
        options: [
          { kg: 1, price: 7199, m2: 10 },
          { kg: 5, price: 5608, m2: 50 }
        ],
        info: 'Erősebb tapadás, problémás felületekre'
      },
      barrier: { 
        name: 'Primapox 100 Barrier', 
        options: [
          { kg: 5, price: 14304, m2: 10 },
          { kg: 20, price: 9520, m2: 40 }
        ],
        info: '2 komponensű, vízálló alapozó'
      },
      grip: { 
        name: 'Primacem Grip', 
        options: [{ kg: 5, price: 4338, m2: 20 }],
        info: 'Tapadásfokozó adalék'
      }
    },
    halo: [
      { price: 1038, m2: 50 },
      { price: 1050, m2: 1 }
    ],
    mikrocementek: {
      xl: { name: 'Natture XL', kgPerM2: 1, literPerKg: 0.3, info: 'Legnagyobb szemcse, 3 réteg' },
      l: { name: 'Natture L', kgPerM2: 0.7, literPerKg: 0.33, info: 'Nagy szemcse, 3 réteg' },
      m: { name: 'Natture M', kgPerM2: 0.5, literPerKg: 0.37, info: 'Közepes szemcse, 3 réteg' },
      s: { name: 'Natture S', kgPerM2: 0.25, literPerKg: 0.42, info: 'Finom szemcse, 3 réteg' }
    },
    mikroOptions: {
      xl: [{ kg: 20, price: 2347, m2: 20 }],
      l: [{ kg: 20, price: 2347, m2: 28 }],
      m: [{ kg: 18, price: 2388, m2: 36 }],
      s: [{ kg: 15, price: 3129, m2: 60 }]
    },
    gyanta: [
      { liters: 5, price: 3998 },
      { liters: 25, price: 3119 }
    ],
    presealer: [
      { liters: 1, price: 14967, m2: 16 },
      { liters: 5, price: 10916, m2: 80 }
    ],
    lakkok: {
      onecoat: { 
        name: 'ONE Coat', 
        options: [
          { liters: 1, price: 24190, m2: 16 },
          { liters: 5, price: 23734, m2: 80 }
        ], 
        needPresealer: true,
        info: 'Egyrétegű lakk, PreSealer-rel együtt használandó'
      },
      dragon: { 
        name: 'Dragon', 
        options: [{ liters: 4, price: 105930, m2: 53 }],
        needPresealer: true,
        info: 'Prémium minőség, PreSealer-rel együtt használandó'
      },
      top100: { 
        name: 'TOP 100', 
        options: [
          { liters: 1, price: 39360, m2: 14 },
          { liters: 5, price: 36930, m2: 71 }
        ], 
        needPresealer: false,
        info: 'Kétrétegű lakk, PreSealer nélkül'
      }
    }
  },
  
  effectoQuartz: {
    name: 'Effecto Quartz',
    alapozok: {
      abs: { 
        name: 'Primacem ABS', 
        options: [
          { kg: 1, price: 0, m2: 10 },
          { kg: 5, price: 4178, m2: 50 }
        ],
        info: 'Univerzális alapozó'
      },
      plusz: { 
        name: 'Primacem Plusz', 
        options: [
          { kg: 1, price: 7199, m2: 10 },
          { kg: 5, price: 5608, m2: 50 }
        ],
        info: 'Erősebb tapadás'
      },
      barrier: { 
        name: 'Primapox Barrier', 
        options: [
          { kg: 5, price: 14304, m2: 10 },
          { kg: 20, price: 9520, m2: 40 }
        ],
        info: '2 komponensű alapozó'
      },
      grip: { 
        name: 'Primacem Grip', 
        options: [{ kg: 5, price: 4338, m2: 20 }],
        info: 'Tapadásfokozó'
      }
    },
    padlo: {
      super: {
        name: 'Super grain',
        kgPerM2: 1.3,
        options: [
          { kg: 6, price: 5263, m2: 4.6 },
          { kg: 17, price: 4441, m2: 13 }
        ],
        info: 'Padlóra: 2 réteg Super + 1 réteg Medium'
      },
      medium: {
        name: 'Medium grain',
        kgPerM2: 0.45,
        options: [
          { kg: 6, price: 5518, m2: 13.3 },
          { kg: 17, price: 4728, m2: 37.7 }
        ],
        info: 'Padlóra: befejező réteg'
      }
    },
    fal: {
      big: {
        name: 'Big grain',
        kgPerM2: 0.9,
        options: [
          { kg: 6, price: 5263, m2: 6.6 },
          { kg: 17, price: 4441, m2: 18.8 }
        ],
        info: 'Falra: 2 réteg Big + 1 réteg Small'
      },
      small: {
        name: 'Small grain',
        kgPerM2: 0.25,
        options: [
          { kg: 6, price: 5390, m2: 24 }
        ],
        info: 'Falra: befejező réteg'
      }
    },
    lakkok: {
      onecoat: { 
        name: 'ONE Coat', 
        options: [
          { liters: 1, price: 24190, m2: 16 },
          { liters: 5, price: 23734, m2: 80 }
        ],
        info: 'Egyrétegű lakk'
      },
      dragon: { 
        name: 'Dragon', 
        options: [{ liters: 4, price: 105930, m2: 53 }],
        info: 'Prémium minőség'
      },
      top100: { 
        name: 'TOP 100', 
        options: [
          { liters: 1, price: 39360, m2: 14 },
          { liters: 5, price: 36930, m2: 71 }
        ],
        info: 'Kétrétegű lakk'
      }
    }
  },
  
  effectoPU: {
    name: 'Effecto PU',
    alapozok: {
      abs: { 
        name: 'Primacem ABS', 
        options: [{ kg: 5, price: 4178, m2: 50 }],
        info: 'Univerzális alapozó'
      },
      plusz: { 
        name: 'Primacem Plusz', 
        options: [{ kg: 5, price: 5608, m2: 50 }],
        info: 'Erősebb tapadás'
      },
      barrier: { 
        name: 'Primapox Barrier', 
        options: [{ kg: 20, price: 9520, m2: 40 }],
        info: '2 komponensű alapozó'
      }
    },
    mikrocementek: {
      big: { name: 'PU Big', kgPerM2: 0.9, info: 'Nagy szemcse, építkezés' },
      medium: { name: 'PU Medium', kgPerM2: 0.45, info: 'Közepes szemcse' },
      small: { name: 'PU Small', kgPerM2: 0.25, info: 'Finom szemcse, befejezés' }
    },
    mikroOptions: {
      big: [{ kg: 10.875, price: 6816, m2: 12 }],
      medium: [{ kg: 10.875, price: 6816, m2: 24 }],
      small: [{ kg: 10.875, price: 6816, m2: 43 }]
    },
    lakkok: {
      onecoat: { 
        name: 'ONE Coat', 
        options: [
          { liters: 1, price: 24190, m2: 16 },
          { liters: 5, price: 23734, m2: 80 }
        ],
        info: 'Egyrétegű lakk'
      },
      dragon: { 
        name: 'Dragon', 
        options: [{ liters: 4, price: 105930, m2: 53 }],
        info: 'Prémium minőség'
      }
    }
  },
  
  pool: {
    name: 'Pool',
    alapozok: {
      arcicem: { 
        name: 'Arcicem Pool gyanta', 
        options: [
          { liters: 5, price: 4606, m2: 50 },
          { liters: 25, price: 3525, m2: 250 }
        ],
        info: 'Vízzáró alapozó réteg'
      }
    },
    mikrocementek: {
      xxl: {
        name: 'Aquaciment XXL',
        kgPerM2: 2,
        options: [{ kg: 18, price: 1804, m2: 9 }],
        info: '2 réteg XXL'
      },
      xl: {
        name: 'Aquaciment XL',
        kgPerM2: 1.5,
        options: [{ kg: 18, price: 2370, m2: 12 }],
        info: '1 réteg XL'
      }
    },
    bkomponens: {
      xxl: {
        literPerKg: 0.31,
        options: [
          { liters: 5, price: 4606 },
          { liters: 25, price: 3525 }
        ]
      },
      xl: {
        literPerKg: 0.35,
        options: [
          { liters: 5, price: 4606 },
          { liters: 25, price: 3521 }
        ]
      }
    },
    lakkok: {
      wt: { 
        name: 'WT Pool', 
        options: [{ liters: 5, price: 15330, m2: 83 }],
        info: '2 réteg vízzáró lakk'
      }
    }
  }
};