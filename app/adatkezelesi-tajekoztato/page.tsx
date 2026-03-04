// app/adatkezeles/page.tsx
// Betonstamp Kft. - Mikrocement Kalkulátor Adatkezelési Tájékoztató

export default function AdatkezelesiTajekoztato() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Betonstamp Kft.</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Mikrocement Kalkulátor Alkalmazás
            <br />
            Adatkezelési Tájékoztató
          </h2>
          <p className="text-sm text-gray-500">
            Verzió: 1.0 | Hatály: 2026. március 4. | Utolsó frissítés: 2026. március 4.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-10">
          {/* 1. Bevezetés */}
          <section>
            <h3 className="text-lg font-bold text-blue-600 mb-3 border-b border-gray-200 pb-2">
              1. Bevezetés
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              A <strong>Betonstamp Kft.</strong> (székhelye: 9721 Gencsapáti, Hunyadi u. 28.,
              adószám: 26260204-2-18, cégjegyzékszám: 18-09-113522) (a továbbiakban:
              Szolgáltató, adatkezelő) a jelen adatkezelési tájékoztató keretében információkat
              nyújt a Mikrocement Kalkulátor alkalmazás (a továbbiakban: Alkalmazás) használata
              során megvalósuló adatkezelésről.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              Az Adatkezelő alá veti magát az Európai Parlament és a Tanács (EU) 2016/679
              Rendeletében (GDPR) foglalt előírásoknak, valamint a magyar adatvédelmi
              jogszabályoknak.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Az Alkalmazás a Betonstamp Kft. által forgalmazott Topciment mikrocement
              rendszerekhez tartozó professzionális anyagszámító eszköz, amely regisztrációhoz
              kötött.
            </p>
          </section>

          {/* 2. Adatkezelő adatai */}
          <section>
            <h3 className="text-lg font-bold text-blue-600 mb-3 border-b border-gray-200 pb-2">
              2. Az adatkezelő és elérhetőségei
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Név:', 'Betonstamp Kft.'],
                    ['Székhely:', '9721 Gencsapáti, Hunyadi u. 28.'],
                    ['Adószám:', '26260204-2-18'],
                    ['Cégjegyzékszám:', '18-09-113522'],
                    ['E-mail:', 'info@betonstamp.hu'],
                    ['Telefon:', '+36 70 336 5701'],
                    ['Weboldal:', 'https://betonstamp.hu'],
                  ].map(([label, value], i) => (
                    <tr key={i} className="border-b border-gray-200 last:border-0">
                      <td className="py-2 pr-4 font-semibold text-gray-600 w-40">{label}</td>
                      <td className="py-2 text-gray-800">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. Regisztráció */}
          <section>
            <h3 className="text-lg font-bold text-blue-600 mb-3 border-b border-gray-200 pb-2">
              3. Regisztráció és felhasználói fiók
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Az Alkalmazás használatához regisztráció szükséges. A regisztráció során az alábbi
              személyes adatok megadását kérjük:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-3 py-2 text-left font-semibold">Személyes adat</th>
                    <th className="px-3 py-2 text-left font-semibold">Az adatkezelés célja</th>
                    <th className="px-3 py-2 text-left font-semibold">Jogalap</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['E-mail cím', 'Azonosítás, regisztráció, bejelentkezés, kapcsolattartás.', 'Az érintett hozzájárulása, GDPR 6. cikk (1) a) pont'],
                    ['Jelszó (titkosítva)', 'A felhasználói fiókba történő biztonságos belépés.', 'Az érintett hozzájárulása, GDPR 6. cikk (1) a) pont'],
                    ['Vezeték- és keresztnév', 'Azonosítás, kapcsolattartás, ajánlatadás.', 'Szerződés teljesítése, GDPR 6. cikk (1) b) pont'],
                    ['Telefonszám', 'Kapcsolattartás, ajánlatkéréssel kapcsolatos egyeztetés.', 'Szerződés teljesítése, GDPR 6. cikk (1) b) pont'],
                    ['Cég neve (opcionális)', 'Céges ügyfelek azonosítása, számlázás.', 'Szerződés teljesítése, GDPR 6. cikk (1) b) pont'],
                    ['Adószám (opcionális)', 'Szabályos számla kiállítása céges ügyfelek részére.', 'Jogi kötelezettség, GDPR 6. cikk (1) c) pont'],
                    ['Irányítószám, település', 'Ügyfél földrajzi elhelyezkedés, szállítás.', 'Szerződés teljesítése, GDPR 6. cikk (1) b) pont'],
                    ['Cím (opcionális)', 'Szállítás, számlázás.', 'Szerződés teljesítése, GDPR 6. cikk (1) b) pont'],
                    ['Regisztráció időpontja', 'Technikai művelet végrehajtása.', 'Szerződés teljesítése, GDPR 6. cikk (1) b) pont'],
                    ['IP cím', 'Technikai művelet, biztonság.', 'Jogos érdek, GDPR 6. cikk (1) f) pont'],
                  ].map(([adat, cel, jogalap], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 font-medium text-gray-800 border-t border-gray-200">{adat}</td>
                      <td className="px-3 py-2 text-gray-600 border-t border-gray-200">{cel}</td>
                      <td className="px-3 py-2 text-gray-600 border-t border-gray-200">{jogalap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-gray-700 leading-relaxed">
                <strong>Érintettek köre:</strong> Az Alkalmazásban regisztrált valamennyi felhasználó.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Adatkezelés időtartama:</strong> A felhasználói fiók törléséig, illetve az
                érintett törlési kérelméig. Számviteli bizonylatok esetén a 2000. évi C. törvény
                169. § (2) bekezdése alapján 8 évig.
              </p>
            </div>
          </section>

          {/* 4. Adattárolás */}
          <section>
            <h3 className="text-lg font-bold text-blue-600 mb-3 border-b border-gray-200 pb-2">
              4. Adattárolás és adatfeldolgozók
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              A regisztráció és a felhasználói fiók adatait a Supabase Inc. (USA) által biztosított
              felhőalapú adatbázisban tároljuk. A Supabase a GDPR előírásainak megfelelő technikai
              és szervezési intézkedéseket alkalmaz az adatok védelme érdekében.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-3 py-2 text-left font-semibold">Adatfeldolgozó</th>
                    <th className="px-3 py-2 text-left font-semibold">Tevékenység</th>
                    <th className="px-3 py-2 text-left font-semibold">Székhely</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Supabase Inc.', 'Felhőalapú adatbázis, felhasználói autentikáció', '548 Market St, San Francisco, CA 94104, USA'],
                    ['Vercel Inc.', 'Weboldal hosting, alkalmazás kiszolgálás', '340 S Lemon Ave #4133, Walnut, CA 91789, USA'],
                    ['MiniCRM Zrt. (tervezett)', 'CRM rendszer, ügyféladatok kezelése', '1075 Budapest, Madách Imre út 13-14., Magyarország'],
                  ].map(([nev, tev, szh], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 font-medium text-gray-800 border-t border-gray-200">{nev}</td>
                      <td className="px-3 py-2 text-gray-600 border-t border-gray-200">{tev}</td>
                      <td className="px-3 py-2 text-gray-600 border-t border-gray-200">{szh}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Adattovábbítás harmadik országba:</strong> A Supabase és a Vercel egyesült
              államokbeli szolgáltatók. Az adattovábbítás az Európai Bizottság által jóváhagyott
              standard szerződési feltételeken (SCC) alapul, a GDPR 46. cikk (2) c) pontjának
              megfelelően.
            </p>
          </section>

          {/* 5. MiniCRM */}
          <section>
            <h3 className="text-lg font-bold text-blue-600 mb-3 border-b border-gray-200 pb-2">
              5. MiniCRM integráció
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Az Alkalmazás a regisztráció során megadott adatokat a Betonstamp Kft. MiniCRM
              ügyfélkapcsolat-kezelési rendszerébe is továbbíthatja az alábbi célból:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-3">
              <li>Új érdeklődők, regisztrálók nyilvántartása</li>
              <li>Kapcsolattartás, ajánlatadás</li>
              <li>Ügyfélszolgálati célok</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              A MiniCRM-be továbbított adatok: név, e-mail cím, telefonszám, cégnév (ha megadta),
              település. Az adattovábbítás jogalapja az érintett hozzájárulása (GDPR 6. cikk (1) a)
              pont), amelyet a regisztráció során a jelölőnégyzet bepipelásakor ad meg.
            </p>
          </section>

          {/* 6. Cookie-k */}
          <section>
            <h3 className="text-lg font-bold text-blue-600 mb-3 border-b border-gray-200 pb-2">
              6. Cookie-k (sütik) kezelése
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Az Alkalmazás az alábbi cookie-kat használja:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-3 py-2 text-left font-semibold">Cookie neve</th>
                    <th className="px-3 py-2 text-left font-semibold">Típus</th>
                    <th className="px-3 py-2 text-left font-semibold">Cél</th>
                    <th className="px-3 py-2 text-left font-semibold">Lejárat</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['sb-*-auth-token', 'Szükséges', 'Bejelentkezési munkamenet fenntartása (Supabase)', 'Munkamenet / 1 hét'],
                    ['sb-*-auth-token-code-verifier', 'Szükséges', 'PKCE autentikáció biztonsági ellenőrzés', 'Munkamenet'],
                  ].map(([nev, tipus, cel, lejar], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 font-mono text-xs text-gray-800 border-t border-gray-200">{nev}</td>
                      <td className="px-3 py-2 text-gray-600 border-t border-gray-200">{tipus}</td>
                      <td className="px-3 py-2 text-gray-600 border-t border-gray-200">{cel}</td>
                      <td className="px-3 py-2 text-gray-600 border-t border-gray-200">{lejar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-gray-700 leading-relaxed mt-4">
              Ezek a cookie-k kizárólag a működési biztonság és a felhasználói munkamenet
              fenntartása érdekében szükségesek, nem tartalmaznak marketing vagy követési
              információt. A cookie-k törlése a böngésző beállításaiban lehetséges.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
              <p className="text-sm text-blue-800">
                <strong>Megjegyzés:</strong> Amennyiben a jövőben Google Analytics vagy egyéb
                statisztikai/marketing cookie-k bevezetésre kerülnek, a jelen tájékoztató
                frissítésre kerül, és az érintettektől különálló hozzájárulás kérése történik.
              </p>
            </div>
          </section>

          {/* 7. Érintettek jogai */}
          <section>
            <h3 className="text-lg font-bold text-blue-600 mb-3 border-b border-gray-200 pb-2">
              7. Az érintettek jogai
            </h3>
            <div className="space-y-3">
              {[
                ['Hozzáférés joga', 'Ön jogosult arra, hogy az adatkezelőtől visszajelzést kapjon arra vonatkozóan, hogy személyes adatainak kezelése folyamatban van-e, és ha ilyen adatkezelés folyamatban van, jogosult arra, hogy a személyes adatokhoz és a rendeletben felsorolt információkhoz hozzáférést kapjon.'],
                ['Helyesbítéshez való jog', 'Ön jogosult arra, hogy kérésére az adatkezelő indokolatlan késedelem nélkül helyesbítse az Önre vonatkozó pontatlan személyes adatokat.'],
                ['Törléshez való jog', 'Ön jogosult arra, hogy kérésére az adatkezelő indokolatlan késedelem nélkül törölje az Önre vonatkozó személyes adatokat, az adatkezelő pedig köteles arra, hogy az Önre vonatkozó személyes adatokat indokolatlan késedelem nélkül törölje meghatározott feltételek esetén.'],
                ['Adatkezelés korlátozásához való jog', 'Ön jogosult arra, hogy kérésére az adatkezelő korlátozza az adatkezelést, ha Ön vitatja a személyes adatok pontosságát, az adatkezelés jogellenes, az adatkezelőnek már nincs szüksége az adatokra, vagy Ön tiltakozott az adatkezelés ellen.'],
                ['Adathordozhatósághoz való jog', 'Ön jogosult arra, hogy az Önre vonatkozó, általa egy adatkezelő rendelkezésére bocsátott személyes adatokat tagolt, széles körben használt, géppel olvasható formátumban megkapja.'],
                ['Tiltakozáshoz való jog', 'Ön jogosult arra, hogy a saját helyzetével kapcsolatos okokból bármikor tiltakozzon személyes adatainak kezelése ellen.'],
                ['Hozzájárulás visszavonása', 'Ön jogosult bármikor visszavonni az adatkezelés alapját képező hozzájárulást. A visszavonás nem érinti a visszavonás előtti adatkezelés jogszerűségét.'],
              ].map(([title, desc], i) => (
                <p key={i} className="text-gray-700 leading-relaxed">
                  <strong>{title}:</strong> {desc}
                </p>
              ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <p className="text-gray-700 font-semibold mb-2">Jogait az alábbi módon gyakorolhatja:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                <li>Postai úton: 9721 Gencsapáti, Hunyadi u. 28.</li>
                <li>E-mailben: info@betonstamp.hu</li>
                <li>Telefonon: +36 70 336 5701</li>
              </ul>
            </div>
          </section>

          {/* 8. Intézkedési határidő */}
          <section>
            <h3 className="text-lg font-bold text-blue-600 mb-3 border-b border-gray-200 pb-2">
              8. Intézkedési határidő
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Az adatkezelő indokolatlan késedelem nélkül, de mindenféleképpen a kérelem
              beérkezésétől számított <strong>1 hónapon belül</strong> tájékoztatja Önt a fenti
              kérelmek nyomán hozott intézkedésekről. Szükség esetén ez{' '}
              <strong>2 hónappal meghosszabbítható</strong>.
            </p>
          </section>

          {/* 9. Adatbiztonság */}
          <section>
            <h3 className="text-lg font-bold text-blue-600 mb-3 border-b border-gray-200 pb-2">
              9. Az adatkezelés biztonsága
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Az adatkezelő az alábbi technikai és szervezési intézkedéseket alkalmazza:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>A jelszavak titkosítva (hash-elve) kerülnek tárolásra, az adatkezelő azokat nem ismeri</li>
              <li>Az adattovábbítás SSL/TLS titkosítással történik</li>
              <li>A Supabase felhőalapú adatbázis Row Level Security (RLS) beállításokkal védett</li>
              <li>A rendszerhez csak jogosultsággal rendelkező személyek férhetnek hozzá</li>
              <li>Rendszeres biztonsági mentések készülnek</li>
            </ul>
          </section>

          {/* 10. Adatvédelmi incidens */}
          <section>
            <h3 className="text-lg font-bold text-blue-600 mb-3 border-b border-gray-200 pb-2">
              10. Adatvédelmi incidens kezelése
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Adatvédelmi incidens esetén az adatkezelő indokolatlan késedelem nélkül, legkésőbb
              72 órán belül bejelenti az illetékes felügyeleti hatóságnak, kivéve ha az incidens
              valószínűsíthetően nem jár kockázattal. Ha az incidens magas kockázattal jár a
              természetes személyek jogaira nézve, az adatkezelő az érintettet is tájékoztatja.
            </p>
          </section>

          {/* 11. Panasztétel */}
          <section>
            <h3 className="text-lg font-bold text-blue-600 mb-3 border-b border-gray-200 pb-2">
              11. Panasztételi lehetőség
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Az adatkezelő esetleges jogsértése ellen panasszal a Nemzeti Adatvédelmi és
              Információszabadság Hatóságnál lehet élni:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-semibold text-gray-800 mb-2">
                Nemzeti Adatvédelmi és Információszabadság Hatóság
              </p>
              <div className="text-sm text-gray-700 space-y-1">
                <p>1055 Budapest, Falk Miksa utca 9-11.</p>
                <p>Levelezési cím: 1363 Budapest, Pf. 9.</p>
                <p>Telefon: +36-1-391-1400</p>
                <p>E-mail: ugyfelszolgalat@naih.hu</p>
                <p>Weboldal: https://naih.hu</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed mt-3">
              Az érintett jogsértés esetén bírósághoz is fordulhat. A per az érintett választása
              szerint az érintett lakóhelye vagy tartózkodási helye szerinti törvényszék előtt
              is megindítható.
            </p>
          </section>

          {/* 12. Záró rendelkezések */}
          <section>
            <h3 className="text-lg font-bold text-blue-600 mb-3 border-b border-gray-200 pb-2">
              12. Záró rendelkezések
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              A jelen adatkezelési tájékoztató 2026. március 4. napjától hatályos. Az adatkezelő
              fenntartja a jogot, hogy a jelen tájékoztató tartalmát egyoldalúan módosítsa. A
              módosításokról az Alkalmazás felületén tájékoztatja a felhasználókat.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              A tájékoztató elkészítése során figyelembe vett főbb jogszabályok:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Az Európai Parlament és a Tanács (EU) 2016/679 Rendelete (GDPR)</li>
              <li>2011. évi CXII. törvény az információs önrendelkezési jogról (Infotv.)</li>
              <li>2001. évi CVIII. törvény az elektronikus kereskedelmi szolgáltatásokról</li>
              <li>2000. évi C. törvény a számvitelről</li>
            </ul>

            <div className="mt-8 pt-4 border-t border-gray-200">
              <p className="text-gray-700">Gencsapáti, 2026. március 4.</p>
              <p className="font-bold text-gray-800 mt-2">Betonstamp Kft.</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2026 Betonstamp Kft. | Minden jog fenntartva.</p>
          <p className="mt-1">
            A fő adatkezelési tájékoztató elérhető:{' '}
            <a
              href="https://betonstamp.hu/adatvedelem"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              betonstamp.hu/adatvedelem
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}