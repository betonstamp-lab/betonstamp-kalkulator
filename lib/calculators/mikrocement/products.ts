import { SystemProducts } from '@/types';

export const PRODUCTS: Record<string, SystemProducts> = {
  natture: {
    name: 'Natture',
    tooltip: 'Kétkomponensű, mészbázisú mikrocement vékony, folytonos bevonatokhoz padlókra és falakra dekoratív felületek kialakításához.',
    alapozok: {
      abs: {
        name: 'Primacem ABS',
        info: 'Nedvszívó alapozó',
        tooltip: 'Akril kopolimereken alapuló alapozó, amelyet tapadóhídként alkalmaznak nedvszívó felületeken a Topciment® mikrocement felhordása előtt.',
        options: [
          { liters: 1, price: 5670, m2: 10 },
          { liters: 5, price: 20890, m2: 50 }
        ]
      },
      plusz: {
        name: 'Primacem Plusz',
        info: 'Nem nedvszívó alapozó',
        tooltip: 'Akril kopolimereken alapuló alapozó, amely tapadóhídként szolgál a nem nedvszívó felületek és a Topciment® mikrocement között.',
        options: [
          { liters: 1, price: 7199, m2: 10 },
          { liters: 5, price: 28040, m2: 50 }
        ]
      },
      barrier: {
        name: 'Primapox 100 Barrier',
        info: 'Párazáró kétkomponensű alapozó',
        tooltip: 'Kétkomponensű, oldószermentes epoxirendszer, 100%-os szárazanyag-tartalommal. Alkalmazása alapozóként javasolt a kapilláris nedvesség elleni védelemre, illetve párazáró rétegként.',
        options: [
          { kg: 5, price: 71520, m2: 10 },
          { kg: 20, price: 190395, m2: 40 }
        ]
      },
      grip: {
        name: 'Primacem Grip',
        info: 'Homokos tapadó híd',
        tooltip: 'Akrilgyanták vizes diszperzióján és szilikátos jellegű töltőanyagokon alapuló alapozó, amely tapadóhídként szolgál minden típusú felület és a mikrocement között.',
        options: [{ kg: 5, price: 21690, m2: 20 }]
      }
    },
    halo: [
      { m2: 50, price: 51895 },
      { m2: 1, price: 1050 }
    ],
    mikrocementek: {
      xl: { 
        name: 'Natture XL', 
        kgPerM2: 1, 
        literPerKg: 0.30,
        info: 'Legnagyobb szemcse, 3 réteg',
        tooltip: 'Kétkomponensű, mészbázisú mikrocement vékony, folytonos bevonatokhoz padlókra és falakra dekoratív felületek kialakításához.',
        options: [{ kg: 20, price: 46930 }]
      },
      l: { 
        name: 'Natture L', 
        kgPerM2: 0.7, 
        literPerKg: 0.33,
        info: 'Nagy szemcse, 3 réteg',
        tooltip: 'Kétkomponensű, mészbázisú mikrocement vékony, folytonos bevonatokhoz padlókra és falakra dekoratív felületek kialakításához.',
        options: [{ kg: 20, price: 46930 }]
      },
      m: { 
        name: 'Natture M', 
        kgPerM2: 0.5, 
        literPerKg: 0.37,
        info: 'Közepes szemcse, 3 réteg',
        tooltip: 'Kétkomponensű, mészbázisú mikrocement vékony, folytonos bevonatokhoz padlókra és falakra dekoratív felületek kialakításához.',
        options: [{ kg: 18, price: 42990 }]
      },
      s: { 
        name: 'Natture S', 
        kgPerM2: 0.25, 
        literPerKg: 0.42,
        info: 'Finom szemcse, 3 réteg',
        tooltip: 'Kétkomponensű, mészbázisú mikrocement vékony, folytonos bevonatokhoz padlókra és falakra dekoratív felületek kialakításához.',
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
      { liters: 5, price: 19990, m2: 0 },
      { liters: 25, price: 77975, m2: 0 }
    ],
    presealer: [
      { liters: 1, price: 19100, m2: 16 },
      { liters: 5, price: 54580, m2: 80 }
    ],
    lakkok: {
      onecoat_matt: {
        name: 'ONE Coat (matt)',
        info: 'Kétrétegű lakk PreSealer-rel együtt (A+B komponens)',
        tooltip: 'Nagy teljesítményű, kétkomponensű, vízalapú poliuretán lakk, amelyet különösen beltéri mikrocement védő tömítőszereként ajánlanak.',
        needPresealer: true,
        options: [
          { liters: 1.2, price: 24190, m2: 16 },
          { liters: 6, price: 118670, m2: 80 }
        ]
      },
      onecoat_selyem: {
        name: 'ONE Coat (selyemfény)',
        info: 'Kétrétegű lakk PreSealer-rel együtt (A+B komponens)',
        tooltip: 'Nagy teljesítményű, kétkomponensű, vízalapú poliuretán lakk, amelyet különösen beltéri mikrocement védő tömítőszereként ajánlanak.',
        needPresealer: true,
        options: [
          { liters: 1.2, price: 24190, m2: 16 },
          { liters: 6, price: 118670, m2: 80 }
        ]
      },
      onecoat_fenyes: {
        name: 'ONE Coat (fényes)',
        info: 'Kétrétegű lakk PreSealer-rel együtt (A+B komponens)',
        tooltip: 'Nagy teljesítményű, kétkomponensű, vízalapú poliuretán lakk, amelyet különösen beltéri mikrocement védő tömítőszereként ajánlanak.',
        needPresealer: true,
        options: [
          { liters: 1.2, price: 24190, m2: 16 },
          { liters: 6, price: 118670, m2: 80 }
        ]
      },
      dragon_matt: {
        name: 'Dragon (matt)',
        info: 'Prémium minőség PreSealer-rel együtt (A+B komponens)',
        tooltip: 'Különösen ajánlott mikrocement védőzáró rétegeként beltéri és kültéri felhasználásra egyaránt. Alkalmazása javasolt padlók, sportpályák, fa, parketta, vizes helyiségek vagy nagy igénybevételnek kitett felületek esetében.',
        needPresealer: true,
        options: [{ liters: 4, price: 105930, m2: 53 }]
      },
      dragon_selyem: {
        name: 'Dragon (selyemfény)',
        info: 'Prémium minőség PreSealer-rel együtt (A+B komponens)',
        tooltip: 'Különösen ajánlott mikrocement védőzáró rétegeként beltéri és kültéri felhasználásra egyaránt. Alkalmazása javasolt padlók, sportpályák, fa, parketta, vizes helyiségek vagy nagy igénybevételnek kitett felületek esetében.',
        needPresealer: true,
        options: [{ liters: 4, price: 105930, m2: 53 }]
      },
      dragon_fenyes: {
        name: 'Dragon (fényes)',
        info: 'Prémium minőség PreSealer-rel együtt (A+B komponens)',
        tooltip: 'Különösen ajánlott mikrocement védőzáró rétegeként beltéri és kültéri felhasználásra egyaránt. Alkalmazása javasolt padlók, sportpályák, fa, parketta, vizes helyiségek vagy nagy igénybevételnek kitett felületek esetében.',
        needPresealer: true,
        options: [{ liters: 4, price: 105930, m2: 53 }]
      },
      top100_matt: {
        name: 'TOP 100 (matt)',
        info: 'Kétrétegű lakk PreSealer nélkül',
        tooltip: 'Nagy teljesítményű, 100% szárazanyag-tartalmú, poliuretán alapú lakk, beltéri és kültéri használatra, folytonos ipari és dekoratív padlóburkolatok végső bevonataként, nagy kémiai és mechanikai teljesítménnyel.',
        needPresealer: false,
        options: [
          { liters: 1, price: 39360, m2: 14 },
          { liters: 5, price: 184650, m2: 71 }
        ]
      },
      top100_fenyes: {
        name: 'TOP 100 (fényes)',
        info: 'Kétrétegű lakk PreSealer nélkül',
        tooltip: 'Nagy teljesítményű, 100% szárazanyag-tartalmú, poliuretán alapú lakk, beltéri és kültéri használatra, folytonos ipari és dekoratív padlóburkolatok végső bevonataként, nagy kémiai és mechanikai teljesítménnyel.',
        needPresealer: false,
        options: [
          { liters: 1, price: 39360, m2: 14 },
          { liters: 5, price: 184650, m2: 71 }
        ]
      },
      toppro_lassukotesu: {
        name: 'TOP PRO+ (lassú kötésű)',
        info: 'Professzionális lakk (A+B komponens)',
        tooltip: 'Alapozót nem igénylő, 100% szárazanyag-tartalmú, kétkomponensű lakk. Gyorsan kötő, hideg poliurea alapú, alkalmas mikrocement védelmére beltérben és kültérben egyaránt.',
        needPresealer: false,
        options: [{ liters: 1.44, price: 57985, m2: 18 }]
      },
      toppro_gyorskotesu: {
        name: 'TOP PRO+ (gyors kötésű)',
        info: 'Professzionális lakk (A+B komponens)',
        tooltip: '100% szárazanyag-tartalmú, kétkomponensű lakk poliaszpartikus gyantákból. Alkalmas mikrocement védelmére beltérben és kültérben.',
        needPresealer: false,
        options: [{ liters: 1.44, price: 57985, m2: 18 }]
      }
    }
  },
  effectoQuartz: {
    name: 'Efectto Quartz',
    tooltip: 'Dekoratív, tartós és használatra kész, folytonos bevonat, amelyet kifejezetten belső falak és padlók előkészítő rétegeként terveztek.',
    alapozok: {
      abs: {
        name: 'Primacem ABS',
        info: 'Nedvszívó alapozó',
        tooltip: 'Akril kopolimereken alapuló alapozó, amelyet tapadóhídként alkalmaznak nedvszívó felületeken a Topciment® mikrocement felhordása előtt.',
        options: [
          { liters: 1, price: 5670, m2: 10 },
          { liters: 5, price: 20890, m2: 50 }
        ]
      },
      plusz: {
        name: 'Primacem Plusz',
        info: 'Nem nedvszívó alapozó',
        tooltip: 'Akril kopolimereken alapuló alapozó, amely tapadóhídként szolgál a nem nedvszívó felületek és a Topciment® mikrocement között.',
        options: [
          { liters: 1, price: 7199, m2: 10 },
          { liters: 5, price: 28040, m2: 50 }
        ]
      },
      barrier: {
        name: 'Primapox 100 Barrier',
        info: 'Párazáró kétkomponensű alapozó',
        tooltip: 'Kétkomponensű, oldószermentes epoxirendszer, 100%-os szárazanyag-tartalommal. Alkalmazása alapozóként javasolt a kapilláris nedvesség elleni védelemre, illetve párazáró rétegként.',
        options: [
          { kg: 5, price: 71520, m2: 10 },
          { kg: 20, price: 190395, m2: 40 }
        ]
      },
      grip: {
        name: 'Primacem Grip',
        info: 'Homokos tapadó híd',
        tooltip: 'Akrilgyanták vizes diszperzióján és szilikátos jellegű töltőanyagokon alapuló alapozó, amely tapadóhídként szolgál minden típusú felület és a mikrocement között.',
        options: [{ kg: 5, price: 21690, m2: 20 }]
      }
    },
    padlo: {
      super: {
        name: 'Super grain',
        kgPerM2: 1.3,
        info: 'Padló - vastagabb szemcse (2 réteg)',
        tooltip: 'Az Efectto Quartz SUPER GRAIN egy dekoratív, tartós és használatra kész, folytonos bevonat, amelyet kifejezetten belső falak és padlók előkészítő rétegeként terveztek.',
        options: [
          { kg: 6, price: 31580 },
          { kg: 17, price: 75490 }
        ]
      },
      medium: {
        name: 'Medium grain',
        kgPerM2: 0.45,
        info: 'Padló - vékonyabb szemcse (1 réteg)',
        tooltip: 'Az Efectto Quartz MEDIUM GRAIN egy dekoratív, tartós és használatra kész, folytonos bevonat, amelyet kifejezetten belső falak és padlók előkészítő rétegeként terveztek.',
        options: [
          { kg: 6, price: 33110 },
          { kg: 17, price: 80380 }
        ]
      }
    },
    fal: {
      big: {
        name: 'Big grain',
        kgPerM2: 0.9,
        info: 'Fal - vastagabb szemcse (2 réteg)',
        tooltip: 'Az Efectto Quartz BIG GRAIN egy dekoratív, tartós és használatra kész, folytonos bevonat, amelyet kifejezetten belső falak és padlók előkészítő rétegeként terveztek.',
        options: [
          { kg: 6, price: 31580 },
          { kg: 17, price: 75490 }
        ]
      },
      small: {
        name: 'Small grain',
        kgPerM2: 0.25,
        info: 'Fal - vékonyabb szemcse (1 réteg)',
        tooltip: 'Az Efectto Quartz SMALL GRAIN egy dekoratív, tartós és használatra kész, folytonos bevonat, amelyet kifejezetten belső falak és padlók előkészítő rétegeként terveztek.',
        options: [
          { kg: 6, price: 32340 },
          { kg: 17, price: 75487 }
        ]
      }
    },
    lakkok: {
      onecoat_matt: {
        name: 'ONE Coat (matt)',
        info: 'Kétrétegű lakk (A+B komponens)',
        tooltip: 'Nagy teljesítményű, kétkomponensű, vízalapú poliuretán lakk, amelyet különösen beltéri mikrocement védő tömítőszereként ajánlanak.',
        needPresealer: false,
        options: [
          { liters: 1.2, price: 24190, m2: 16 },
          { liters: 6, price: 118670, m2: 80 }
        ]
      },
      onecoat_selyem: {
        name: 'ONE Coat (selyemfény)',
        info: 'Kétrétegű lakk (A+B komponens)',
        tooltip: 'Nagy teljesítményű, kétkomponensű, vízalapú poliuretán lakk, amelyet különösen beltéri mikrocement védő tömítőszereként ajánlanak.',
        needPresealer: false,
        options: [
          { liters: 1.2, price: 24190, m2: 16 },
          { liters: 6, price: 118670, m2: 80 }
        ]
      },
      onecoat_fenyes: {
        name: 'ONE Coat (fényes)',
        info: 'Kétrétegű lakk (A+B komponens)',
        tooltip: 'Nagy teljesítményű, kétkomponensű, vízalapú poliuretán lakk, amelyet különösen beltéri mikrocement védő tömítőszereként ajánlanak.',
        needPresealer: false,
        options: [
          { liters: 1.2, price: 24190, m2: 16 },
          { liters: 6, price: 118670, m2: 80 }
        ]
      },
      dragon_matt: {
        name: 'Dragon (matt)',
        info: 'Prémium minőség (A+B komponens)',
        tooltip: 'Különösen ajánlott mikrocement védőzáró rétegeként beltéri és kültéri felhasználásra egyaránt. Alkalmazása javasolt padlók, sportpályák, fa, parketta, vizes helyiségek vagy nagy igénybevételnek kitett felületek esetében.',
        needPresealer: false,
        options: [{ liters: 4, price: 105930, m2: 53 }]
      },
      dragon_selyem: {
        name: 'Dragon (selyemfény)',
        info: 'Prémium minőség (A+B komponens)',
        tooltip: 'Különösen ajánlott mikrocement védőzáró rétegeként beltéri és kültéri felhasználásra egyaránt. Alkalmazása javasolt padlók, sportpályák, fa, parketta, vizes helyiségek vagy nagy igénybevételnek kitett felületek esetében.',
        needPresealer: false,
        options: [{ liters: 4, price: 105930, m2: 53 }]
      },
      dragon_fenyes: {
        name: 'Dragon (fényes)',
        info: 'Prémium minőség (A+B komponens)',
        tooltip: 'Különösen ajánlott mikrocement védőzáró rétegeként beltéri és kültéri felhasználásra egyaránt. Alkalmazása javasolt padlók, sportpályák, fa, parketta, vizes helyiségek vagy nagy igénybevételnek kitett felületek esetében.',
        needPresealer: false,
        options: [{ liters: 4, price: 105930, m2: 53 }]
      },
      top100_matt: {
        name: 'TOP 100 (matt)',
        info: 'Kétrétegű lakk',
        tooltip: 'Nagy teljesítményű, 100% szárazanyag-tartalmú, poliuretán alapú lakk, beltéri és kültéri használatra, folytonos ipari és dekoratív padlóburkolatok végső bevonataként, nagy kémiai és mechanikai teljesítménnyel.',
        needPresealer: false,
        options: [
          { liters: 1, price: 39360, m2: 14 },
          { liters: 5, price: 184650, m2: 71 }
        ]
      },
      top100_fenyes: {
        name: 'TOP 100 (fényes)',
        info: 'Kétrétegű lakk',
        tooltip: 'Nagy teljesítményű, 100% szárazanyag-tartalmú, poliuretán alapú lakk, beltéri és kültéri használatra, folytonos ipari és dekoratív padlóburkolatok végső bevonataként, nagy kémiai és mechanikai teljesítménnyel.',
        needPresealer: false,
        options: [
          { liters: 1, price: 39360, m2: 14 },
          { liters: 5, price: 184650, m2: 71 }
        ]
      },
      toppro_lassukotesu: {
        name: 'TOP PRO+ (lassú kötésű)',
        info: 'Professzionális lakk (A+B komponens)',
        tooltip: 'Alapozót nem igénylő, 100% szárazanyag-tartalmú, kétkomponensű lakk. Gyorsan kötő, hideg poliurea alapú, alkalmas mikrocement védelmére beltérben és kültérben egyaránt.',
        needPresealer: false,
        options: [{ liters: 1.44, price: 57985, m2: 18 }]
      },
      toppro_gyorskotesu: {
        name: 'TOP PRO+ (gyors kötésű)',
        info: 'Professzionális lakk (A+B komponens)',
        tooltip: '100% szárazanyag-tartalmú, kétkomponensű lakk poliaszpartikus gyantákból. Alkalmas mikrocement védelmére beltérben és kültérben.',
        needPresealer: false,
        options: [{ liters: 1.44, price: 57985, m2: 18 }]
      }
    }
  },
  effectoPU: {
    name: 'Efectto PU',
    tooltip: 'Nagy teljesítményű, kétkomponensű, vízalapú poliuretán mikrocement, folytonos dekoratív felületek kialakítására, beltérben és kültérben egyaránt.',
    alapozok: {
      abs: {
        name: 'Primacem ABS',
        info: 'Nedvszívó alapozó',
        tooltip: 'Akril kopolimereken alapuló alapozó, amelyet tapadóhídként alkalmaznak nedvszívó felületeken a Topciment® mikrocement felhordása előtt.',
        options: [
          { liters: 1, price: 5670, m2: 10 },
          { liters: 5, price: 20890, m2: 50 }
        ]
      },
      plusz: {
        name: 'Primacem Plusz',
        info: 'Nem nedvszívó alapozó',
        tooltip: 'Akril kopolimereken alapuló alapozó, amely tapadóhídként szolgál a nem nedvszívó felületek és a Topciment® mikrocement között.',
        options: [
          { liters: 1, price: 7199, m2: 10 },
          { liters: 5, price: 28040, m2: 50 }
        ]
      },
      barrier: {
        name: 'Primapox 100 Barrier',
        info: 'Párazáró kétkomponensű alapozó',
        tooltip: 'Kétkomponensű, oldószermentes epoxirendszer, 100%-os szárazanyag-tartalommal. Alkalmazása alapozóként javasolt a kapilláris nedvesség elleni védelemre, illetve párazáró rétegként.',
        options: [
          { kg: 5, price: 71520, m2: 10 },
          { kg: 20, price: 190395, m2: 40 }
        ]
      },
      grip: {
        name: 'Primacem Grip',
        info: 'Homokos tapadó híd',
        tooltip: 'Akrilgyanták vizes diszperzióján és szilikátos jellegű töltőanyagokon alapuló alapozó, amely tapadóhídként szolgál minden típusú felület és a mikrocement között.',
        options: [{ kg: 5, price: 21690, m2: 20 }]
      }
    },
    mikrocementek: {
      big: {
        name: 'Efectto PU Big grain',
        kgPerM2: 2.7,
        info: 'Nagy szemcse (A+B komponens), 3 réteg = 2.7 kg/m²',
        tooltip: 'Az Efectto PU BIG GRAIN egy nagy teljesítményű, kétkomponensű, vízalapú poliuretán mikrocement, folytonos dekoratív felületek kialakítására, beltérben és kültérben egyaránt.',
        options: [
          { kg: 10.875, price: 80605 },
          { kg: 2.21, price: 33412 }
        ]
      },
      medium: {
        name: 'Efectto PU Medium grain',
        kgPerM2: 1.35,
        info: 'Közepes szemcse (A+B komponens), 3 réteg = 1.35 kg/m²',
        tooltip: 'Az Efectto PU MEDIUM GRAIN egy nagy teljesítményű, kétkomponensű, vízalapú poliuretán mikrocement, folytonos dekoratív felületek kialakítására, beltérben és kültérben egyaránt.',
        options: [
          { kg: 10.875, price: 80605 },
          { kg: 2.21, price: 33517 }
        ]
      },
      small: {
        name: 'Efectto PU Small grain',
        kgPerM2: 0.75,
        info: 'Finom szemcse (A+B komponens), 3 réteg = 0.75 kg/m²',
        tooltip: 'Az Efectto PU SMALL GRAIN egy nagy teljesítményű, kétkomponensű, vízalapú poliuretán mikrocement, folytonos dekoratív felületek kialakítására, beltérben és kültérben egyaránt.',
        options: [
          { kg: 10.875, price: 80605 },
          { kg: 2.21, price: 33592 }
        ]
      }
    },
    mikroOptions: {
      big: [
        { kg: 10.875, price: 80605 },
        { kg: 2.21, price: 33412 }
      ],
      medium: [
        { kg: 10.875, price: 80605 },
        { kg: 2.21, price: 33517 }
      ],
      small: [
        { kg: 10.875, price: 80605 },
        { kg: 2.21, price: 33592 }
      ]
    },
    lakkok: {
      onecoat_matt: {
        name: 'ONE Coat (matt)',
        info: 'Kétrétegű lakk (A+B komponens)',
        tooltip: 'Nagy teljesítményű, kétkomponensű, vízalapú poliuretán lakk, amelyet különösen beltéri mikrocement védő tömítőszereként ajánlanak.',
        needPresealer: false,
        options: [
          { liters: 1.2, price: 24190, m2: 16 },
          { liters: 6, price: 118670, m2: 80 }
        ]
      },
      onecoat_selyem: {
        name: 'ONE Coat (selyemfény)',
        info: 'Kétrétegű lakk (A+B komponens)',
        tooltip: 'Nagy teljesítményű, kétkomponensű, vízalapú poliuretán lakk, amelyet különösen beltéri mikrocement védő tömítőszereként ajánlanak.',
        needPresealer: false,
        options: [
          { liters: 1.2, price: 24190, m2: 16 },
          { liters: 6, price: 118670, m2: 80 }
        ]
      },
      onecoat_fenyes: {
        name: 'ONE Coat (fényes)',
        info: 'Kétrétegű lakk (A+B komponens)',
        tooltip: 'Nagy teljesítményű, kétkomponensű, vízalapú poliuretán lakk, amelyet különösen beltéri mikrocement védő tömítőszereként ajánlanak.',
        needPresealer: false,
        options: [
          { liters: 1.2, price: 24190, m2: 16 },
          { liters: 6, price: 118670, m2: 80 }
        ]
      },
      dragon_matt: {
        name: 'Dragon (matt)',
        info: 'Prémium minőség (A+B komponens)',
        tooltip: 'Különösen ajánlott mikrocement védőzáró rétegeként beltéri és kültéri felhasználásra egyaránt. Alkalmazása javasolt padlók, sportpályák, fa, parketta, vizes helyiségek vagy nagy igénybevételnek kitett felületek esetében.',
        needPresealer: false,
        options: [{ liters: 4, price: 105930, m2: 53 }]
      },
      dragon_selyem: {
        name: 'Dragon (selyemfény)',
        info: 'Prémium minőség (A+B komponens)',
        tooltip: 'Különösen ajánlott mikrocement védőzáró rétegeként beltéri és kültéri felhasználásra egyaránt. Alkalmazása javasolt padlók, sportpályák, fa, parketta, vizes helyiségek vagy nagy igénybevételnek kitett felületek esetében.',
        needPresealer: false,
        options: [{ liters: 4, price: 105930, m2: 53 }]
      },
      dragon_fenyes: {
        name: 'Dragon (fényes)',
        info: 'Prémium minőség (A+B komponens)',
        tooltip: 'Különösen ajánlott mikrocement védőzáró rétegeként beltéri és kültéri felhasználásra egyaránt. Alkalmazása javasolt padlók, sportpályák, fa, parketta, vizes helyiségek vagy nagy igénybevételnek kitett felületek esetében.',
        needPresealer: false,
        options: [{ liters: 4, price: 105930, m2: 53 }]
      },
      top100_matt: {
        name: 'TOP 100 (matt)',
        info: 'Kétrétegű lakk',
        tooltip: 'Nagy teljesítményű, 100% szárazanyag-tartalmú, poliuretán alapú lakk, beltéri és kültéri használatra, folytonos ipari és dekoratív padlóburkolatok végső bevonataként, nagy kémiai és mechanikai teljesítménnyel.',
        needPresealer: false,
        options: [
          { liters: 1, price: 39360, m2: 14 },
          { liters: 5, price: 184650, m2: 71 }
        ]
      },
      top100_fenyes: {
        name: 'TOP 100 (fényes)',
        info: 'Kétrétegű lakk',
        tooltip: 'Nagy teljesítményű, 100% szárazanyag-tartalmú, poliuretán alapú lakk, beltéri és kültéri használatra, folytonos ipari és dekoratív padlóburkolatok végső bevonataként, nagy kémiai és mechanikai teljesítménnyel.',
        needPresealer: false,
        options: [
          { liters: 1, price: 39360, m2: 14 },
          { liters: 5, price: 184650, m2: 71 }
        ]
      },
      toppro_lassukotesu: {
        name: 'TOP PRO+ (lassú kötésű)',
        info: 'Professzionális lakk (A+B komponens)',
        tooltip: 'Alapozót nem igénylő, 100% szárazanyag-tartalmú, kétkomponensű lakk. Gyorsan kötő, hideg poliurea alapú, alkalmas mikrocement védelmére beltérben és kültérben egyaránt.',
        needPresealer: false,
        options: [{ liters: 1.44, price: 57985, m2: 18 }]
      },
      toppro_gyorskotesu: {
        name: 'TOP PRO+ (gyors kötésű)',
        info: 'Professzionális lakk (A+B komponens)',
        tooltip: '100% szárazanyag-tartalmú, kétkomponensű lakk poliaszpartikus gyantákból. Alkalmas mikrocement védelmére beltérben és kültérben.',
        needPresealer: false,
        options: [{ liters: 1.44, price: 57985, m2: 18 }]
      }
    }
  },
  pool: {
    name: 'Pool',
    tooltip: 'Az Atlanttic Aquaciment® kétkomponensű mikrocement rendszert kifejezetten medencékben való alkalmazásra fejlesztették ki.',
    alapozok: {
      arcicem: {
        name: 'Arcicem Pool vízbázisú akrilgyanta, az Atlanttic Aquaciment "B" komponense és alapozója (TT01016)',
        info: 'Vízbázisú akrilgyanta medencékhez',
        tooltip: 'Az Acricem Pool egy vízalapú akrilgyanta, amelyet az Atlanttic Aquaciment® medence-mikrocement rendszerhez fejlesztettek ki.',
        options: [
          { liters: 5, price: 23030, m2: 50 },
          { liters: 25, price: 88115, m2: 250 }
        ]
      }
    },
    mikrocementek: {
      xxl: { 
        name: 'Atlanttic Aquaciment XXL 18Kg - előkészítő mikrocement medencékhez (TT01050)', 
        kgPerM2: 4.05,
        info: '2 réteg',
        tooltip: 'Az Atlanttic Aquaciment® kétkomponensű mikrocement rendszert kifejezetten medencékben való alkalmazásra fejlesztették ki.',
        options: [{ kg: 18, price: 32480 }]
      },
      xl: { 
        name: 'Atlanttic Aquaciment XL 18Kg - befejező mikrocement medencékhez (TT01051)', 
        kgPerM2: 1.53,
        info: '1 réteg',
        tooltip: 'Az Atlanttic Aquaciment® kétkomponensű mikrocement rendszert kifejezetten medencékben való alkalmazásra fejlesztették ki.',
        options: [{ kg: 18, price: 42660 }]
      }
    },
    lakkok: {
      wt: {
        name: 'Topsealer WT Pool 5L - lakk mikrocement medencékhez (TT02070)',
        info: 'Medence lakk - 2 réteg',
        tooltip: 'A Topsealer® WT Pool egy lítiumsó-alapú, vízalapú zárólakk az Atlanttic rendszerhez, amely védő és konszolidáló filmet képez.',
        options: [{ liters: 5, price: 76650, m2: 83 }]
      }
    }
  }
};
