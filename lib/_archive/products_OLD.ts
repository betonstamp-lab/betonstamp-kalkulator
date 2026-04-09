import { SystemProducts } from '@/types';

export const PRODUCTS: Record<string, SystemProducts> = {
  natture: {
    name: 'Natture',
    alapozok: {
      abs: {
        name: 'Primacem ABS',
        info: 'Univerzális alapozó minden felületre',
        options: [
          { kg: 1, price: 0, m2: 10 },
          { kg: 5, price: 4178, m2: 50 }
        ]
      },
      plusz: {
        name: 'Primacem Plusz',
        info: 'Erősebb tapadás, problémás felületekre',
        options: [
          { kg: 1, price: 7199, m2: 10 },
          { kg: 5, price: 5608, m2: 50 }
        ]
      },
      barrier: {
        name: 'Primapox 100 Barrier',
        info: '2 komponensű, vízálló alapozó',
        options: [
          { kg: 5, price: 14304, m2: 10 },
          { kg: 20, price: 9520, m2: 40 }
        ]
      },
      grip: {
        name: 'Primacem Grip',
        info: 'Tapadásfokozó adalék',
        options: [{ kg: 5, price: 4338, m2: 20 }]
      }
    },
    halo: [
      { kg: 50, price: 9460, m2: 50 }
    ],
mikrocementek: {
  xl: { 
    name: 'Natture XL', 
    kgPerM2: 1, 
    literPerKg: 0.30, 
    info: 'Legnagyobb szemcse, 3 réteg',
    options: [{ kg: 20, price: 46930 }]
  },
  l: { 
    name: 'Natture L', 
    kgPerM2: 0.7, 
    literPerKg: 0.33, 
    info: 'Nagy szemcse, 3 réteg',
    options: [{ kg: 20, price: 46930 }]
  },
  m: { 
    name: 'Natture M', 
    kgPerM2: 0.5, 
    literPerKg: 0.37, 
    info: 'Közepes szemcse, 3 réteg',
    options: [{ kg: 18, price: 42990 }]
  },
  s: { 
    name: 'Natture S', 
    kgPerM2: 0.25, 
    literPerKg: 0.42, 
    info: 'Finom szemcse, 3 réteg',
    options: [{ kg: 15, price: 46930 }]
  }
    },
    mikroOptions: {
  xl: [{ kg: 20, price: 46930 }],
  l: [{ kg: 20, price: 46930 }],
  m: [{ kg: 18, price: 42990 }],
  s: [{ kg: 15, price: 46930 }]
},
    gyanta: [
  { liters: 1, price: 19990, m2: 0 },
  { liters: 5, price: 19990, m2: 0 },
  { liters: 25, price: 77975, m2: 0 }
],
    presealer: [{ liters: 5, price: 10916, m2: 50 }],
    lakkok: {
      onecoat: {
        name: 'ONE Coat',
        info: 'Egyrétegű lakk, PreSealer-rel együtt használandó',
        needPresealer: true,
        options: [
          { liters: 1, price: 24190, m2: 16 },
          { liters: 5, price: 23734, m2: 80 }
        ]
      },
      dragon: {
        name: 'Dragon',
        info: 'Prémium minőség, PreSealer-rel együtt használandó',
        needPresealer: true,
        options: [{ liters: 4, price: 105930, m2: 53 }]
      },
      top100: {
        name: 'TOP 100',
        info: 'Kétrétegű lakk, PreSealer nélkül',
        needPresealer: false,
        options: [
          { liters: 1, price: 39360, m2: 14 },
          { liters: 5, price: 36930, m2: 71 }
        ]
      }
    }
  },
  effectoQuartz: {
    name: 'Effecto Quartz',
    alapozok: {
      abs: {
        name: 'Primacem ABS',
        info: 'Univerzális alapozó',
        options: [{ kg: 5, price: 4178, m2: 50 }]
      },
      plusz: {
        name: 'Primacem Plusz',
        info: 'Erősebb tapadás',
        options: [{ kg: 5, price: 5608, m2: 50 }]
      }
    },
    padlo: {
      super: {
        name: 'Super grain',
        kgPerM2: 2.25,
        info: 'Padló - 2 réteg',
        options: [{ kg: 20, price: 2620 }]
      },
      medium: {
        name: 'Medium grain',
        kgPerM2: 1.125,
        info: 'Padló - 1 réteg',
        options: [{ kg: 20, price: 2620 }]
      }
    },
    fal: {
      big: {
        name: 'Big grain',
        kgPerM2: 1.5,
        info: 'Fal - durva szemcse',
        options: [{ kg: 20, price: 2620 }]
      },
      small: {
        name: 'Small grain',
        kgPerM2: 0.75,
        info: 'Fal - finom szemcse',
        options: [{ kg: 20, price: 2620 }]
      }
    },
    lakkok: {
      presealer: {
        name: 'PreSealer',
        info: 'Alapozó lakk',
        options: [{ liters: 5, price: 10916, m2: 50 }]
      },
      topsealer: {
        name: 'TopSealer',
        info: 'Végső lakk',
        options: [{ liters: 5, price: 23734, m2: 80 }]
      }
    }
  },
  effectoPU: {
    name: 'Effecto PU',
    alapozok: {
      abs: {
        name: 'Primacem ABS',
        info: 'Univerzális alapozó',
        options: [{ kg: 5, price: 4178, m2: 50 }]
      },
      barrier: {
        name: 'Primapox 100 Barrier',
        info: '2 komponensű, vízálló',
        options: [{ kg: 20, price: 9520, m2: 40 }]
      }
    },
    mikrocementek: {
      big: {
        name: 'PU Big',
        kgPerM2: 1.5,
        info: 'Nagy szemcse, 3 réteg',
        options: [{ kg: 20, price: 3870 }]
      },
      medium: {
        name: 'PU Medium',
        kgPerM2: 1.125,
        info: 'Közepes szemcse, 3 réteg',
        options: [{ kg: 20, price: 3870 }]
      },
      small: {
        name: 'PU Small',
        kgPerM2: 0.75,
        info: 'Finom szemcse, 3 réteg',
        options: [{ kg: 20, price: 3870 }]
      }
    },
mikroOptions: {
  big: [{ kg: 20, price: 3870 }],
  medium: [{ kg: 20, price: 3870 }],
  small: [{ kg: 20, price: 3870 }]
},
    lakkok: {
      pu: {
        name: 'PU Lakk',
        info: '2 komponensű PU lakk',
        options: [{ liters: 6, price: 53700, m2: 72 }]
      }
    }
  },
pool: {
  name: 'Pool',
  alapozok: {
    arcicem: {
      name: 'Arcicem Pool 25L vízbázisú akrilgyanta, az Atlanttic Aquaciment "B" komponense és alapozója (TT01016)',
      info: 'Vízbázisú akrilgyanta medencékhez',
      options: [{ liters: 25, price: 88115, m2: 200 }]
    }
  },
  mikrocementek: {
    xxl: { 
      name: 'Atlanttic Aquaciment XXL 18Kg - előkészítő mikrocement medencékhez (TT01050)', 
      kgPerM2: 4.05,
      info: '2 réteg',
      options: [{ kg: 18, price: 32480 }]
    },
    xl: { 
      name: 'Atlanttic Aquaciment XL 18Kg - befejező mikrocement medencékhez (TT01051)', 
      kgPerM2: 1.53,
      info: '1 réteg',
      options: [{ kg: 18, price: 42660 }]
    }
  },
  lakkok: {
    wt: {
      name: 'Topsealer WT Pool 5L - lakk mikrocement medencékhez (TT02070)',
      info: 'Medence lakk - 2 réteg',
      options: [{ liters: 5, price: 76650, m2: 80 }]
}
  }
},
};