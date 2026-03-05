'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Irányítószám-település térkép (bővíthető)
const postalCodeMap: Record<string, string> = {
  '1011': 'Budapest',
  '1012': 'Budapest',
  '1013': 'Budapest',
  '1014': 'Budapest',
  '1015': 'Budapest',
  '1016': 'Budapest',
  '1021': 'Budapest',
  '1022': 'Budapest',
  '1023': 'Budapest',
  '1024': 'Budapest',
  '1025': 'Budapest',
  '1026': 'Budapest',
  '1027': 'Budapest',
  '1028': 'Budapest',
  '1029': 'Budapest',
  '1031': 'Budapest',
  '1032': 'Budapest',
  '1033': 'Budapest',
  '1034': 'Budapest',
  '1035': 'Budapest',
  '1036': 'Budapest',
  '1037': 'Budapest',
  '1038': 'Budapest',
  '1039': 'Budapest',
  '1041': 'Budapest',
  '1042': 'Budapest',
  '1043': 'Budapest',
  '1044': 'Budapest',
  '1045': 'Budapest',
  '1046': 'Budapest',
  '1047': 'Budapest',
  '1048': 'Budapest',
  '1049': 'Budapest',
  '1051': 'Budapest',
  '1052': 'Budapest',
  '1053': 'Budapest',
  '1054': 'Budapest',
  '1055': 'Budapest',
  '1056': 'Budapest',
  '1061': 'Budapest',
  '1062': 'Budapest',
  '1063': 'Budapest',
  '1064': 'Budapest',
  '1065': 'Budapest',
  '1066': 'Budapest',
  '1067': 'Budapest',
  '1068': 'Budapest',
  '1071': 'Budapest',
  '1072': 'Budapest',
  '1073': 'Budapest',
  '1074': 'Budapest',
  '1075': 'Budapest',
  '1076': 'Budapest',
  '1077': 'Budapest',
  '1078': 'Budapest',
  '1081': 'Budapest',
  '1082': 'Budapest',
  '1083': 'Budapest',
  '1084': 'Budapest',
  '1085': 'Budapest',
  '1086': 'Budapest',
  '1087': 'Budapest',
  '1088': 'Budapest',
  '1089': 'Budapest',
  '1091': 'Budapest',
  '1092': 'Budapest',
  '1093': 'Budapest',
  '1094': 'Budapest',
  '1095': 'Budapest',
  '1096': 'Budapest',
  '1097': 'Budapest',
  '1098': 'Budapest',
  '1101': 'Budapest',
  '1102': 'Budapest',
  '1103': 'Budapest',
  '1104': 'Budapest',
  '1105': 'Budapest',
  '1106': 'Budapest',
  '1107': 'Budapest',
  '1108': 'Budapest',
  '1111': 'Budapest',
  '1112': 'Budapest',
  '1113': 'Budapest',
  '1114': 'Budapest',
  '1115': 'Budapest',
  '1116': 'Budapest',
  '1117': 'Budapest',
  '1118': 'Budapest',
  '1119': 'Budapest',
  '1121': 'Budapest',
  '1122': 'Budapest',
  '1123': 'Budapest',
  '1124': 'Budapest',
  '1125': 'Budapest',
  '1126': 'Budapest',
  '1131': 'Budapest',
  '1132': 'Budapest',
  '1133': 'Budapest',
  '1134': 'Budapest',
  '1135': 'Budapest',
  '1136': 'Budapest',
  '1137': 'Budapest',
  '1138': 'Budapest',
  '1139': 'Budapest',
  '1141': 'Budapest',
  '1142': 'Budapest',
  '1143': 'Budapest',
  '1144': 'Budapest',
  '1145': 'Budapest',
  '1146': 'Budapest',
  '1147': 'Budapest',
  '1148': 'Budapest',
  '1149': 'Budapest',
  '1151': 'Budapest',
  '1152': 'Budapest',
  '1153': 'Budapest',
  '1154': 'Budapest',
  '1155': 'Budapest',
  '1156': 'Budapest',
  '1157': 'Budapest',
  '1158': 'Budapest',
  '1161': 'Budapest',
  '1162': 'Budapest',
  '1163': 'Budapest',
  '1164': 'Budapest',
  '1165': 'Budapest',
  '1171': 'Budapest',
  '1172': 'Budapest',
  '1173': 'Budapest',
  '1174': 'Budapest',
  '1181': 'Budapest',
  '1182': 'Budapest',
  '1183': 'Budapest',
  '1184': 'Budapest',
  '1185': 'Budapest',
  '1186': 'Budapest',
  '1188': 'Budapest',
  '1191': 'Budapest',
  '1192': 'Budapest',
  '1193': 'Budapest',
  '1194': 'Budapest',
  '1195': 'Budapest',
  '1196': 'Budapest',
  '1201': 'Budapest',
  '1202': 'Budapest',
  '1203': 'Budapest',
  '1204': 'Budapest',
  '1205': 'Budapest',
  '1211': 'Budapest',
  '1212': 'Budapest',
  '1213': 'Budapest',
  '1214': 'Budapest',
  '1215': 'Budapest',
  '1221': 'Budapest',
  '1222': 'Budapest',
  '1223': 'Budapest',
  '1224': 'Budapest',
  '1225': 'Budapest',
  '1237': 'Budapest',
  '1238': 'Budapest',
  '1239': 'Budapest',
  '2000': 'Szentendre',
  '2030': 'Érd',
  '2040': 'Budaörs',
  '2045': 'Törökbálint',
  '2051': 'Biatorbágy',
  '2100': 'Gödöllő',
  '2120': 'Dunakeszi',
  '2131': 'Göd',
  '2132': 'Göd',
  '2133': 'Sződliget',
  '2146': 'Mogyoród',
  '2200': 'Monor',
  '2220': 'Vecsés',
  '2225': 'Üllő',
  '2230': 'Gyömrő',
  '2300': 'Ráckeve',
  '2310': 'Szigetszentmiklós',
  '2330': 'Dunaharaszti',
  '2340': 'Kiskunlacháza',
  '2360': 'Gyál',
  '2371': 'Dabas',
  '2400': 'Dunaújváros',
  '2440': 'Százhalombatta',
  '2500': 'Esztergom',
  '2600': 'Vác',
  '2700': 'Cegléd',
  '2730': 'Albertirsa',
  '2740': 'Abony',
  '2800': 'Tatabánya',
  '2890': 'Tata',
  '2900': 'Komárom',
  '2942': 'Nagyigmánd',
  '3000': 'Hatvan',
  '3100': 'Salgótarján',
  '3200': 'Gyöngyös',
  '3300': 'Eger',
  '3400': 'Mezőkövesd',
  '3500': 'Miskolc',
  '3515': 'Miskolc',
  '3525': 'Miskolc',
  '3527': 'Miskolc',
  '3528': 'Miskolc',
  '3529': 'Miskolc',
  '3530': 'Miskolc',
  '3531': 'Miskolc',
  '3532': 'Miskolc',
  '3533': 'Miskolc',
  '3534': 'Miskolc',
  '3535': 'Miskolc',
  '3580': 'Tiszaújváros',
  '3600': 'Ózd',
  '3700': 'Kazincbarcika',
  '3800': 'Szikszó',
  '3900': 'Szerencs',
  '3950': 'Sárospatak',
  '3980': 'Sátoraljaújhely',
  '4000': 'Debrecen',
  '4024': 'Debrecen',
  '4025': 'Debrecen',
  '4026': 'Debrecen',
  '4027': 'Debrecen',
  '4028': 'Debrecen',
  '4029': 'Debrecen',
  '4030': 'Debrecen',
  '4031': 'Debrecen',
  '4032': 'Debrecen',
  '4033': 'Debrecen',
  '4034': 'Debrecen',
  '4100': 'Berettyóújfalu',
  '4150': 'Püspökladány',
  '4200': 'Hajdúszoboszló',
  '4220': 'Hajdúböszörmény',
  '4244': 'Újfehértó',
  '4300': 'Nyírbátor',
  '4400': 'Nyíregyháza',
  '4431': 'Nyíregyháza',
  '4432': 'Nyíregyháza',
  '4433': 'Nyíregyháza',
  '4440': 'Tiszavasvári',
  '4500': 'Kisvárda',
  '4600': 'Kisvárda',
  '4700': 'Mátészalka',
  '4800': 'Vásárosnamény',
  '5000': 'Szolnok',
  '5100': 'Jászberény',
  '5200': 'Törökszentmiklós',
  '5300': 'Karcag',
  '5350': 'Tiszafüred',
  '5400': 'Mezőtúr',
  '5500': 'Gyomaendrőd',
  '5540': 'Szarvas',
  '5600': 'Békéscsaba',
  '5630': 'Békés',
  '5700': 'Gyula',
  '5800': 'Mezőkovácsháza',
  '5900': 'Orosháza',
  '5920': 'Csongrád',
  '6000': 'Kecskemét',
  '6060': 'Tiszakécske',
  '6100': 'Kiskunfélegyháza',
  '6200': 'Kiskőrös',
  '6300': 'Kalocsa',
  '6400': 'Kiskunhalas',
  '6500': 'Baja',
  '6600': 'Szentes',
  '6700': 'Szeged',
  '6720': 'Szeged',
  '6721': 'Szeged',
  '6722': 'Szeged',
  '6723': 'Szeged',
  '6724': 'Szeged',
  '6725': 'Szeged',
  '6726': 'Szeged',
  '6727': 'Szeged',
  '6728': 'Szeged',
  '6729': 'Szeged',
  '6800': 'Hódmezővásárhely',
  '6900': 'Makó',
  '7000': 'Sárbogárd',
  '7030': 'Paks',
  '7090': 'Tamási',
  '7100': 'Szekszárd',
  '7130': 'Tolna',
  '7150': 'Bonyhád',
  '7200': 'Dombóvár',
  '7300': 'Komló',
  '7400': 'Kaposvár',
  '7500': 'Nagyatád',
  '7600': 'Pécs',
  '7621': 'Pécs',
  '7622': 'Pécs',
  '7623': 'Pécs',
  '7624': 'Pécs',
  '7625': 'Pécs',
  '7626': 'Pécs',
  '7627': 'Pécs',
  '7628': 'Pécs',
  '7629': 'Pécs',
  '7630': 'Pécs',
  '7631': 'Pécs',
  '7632': 'Pécs',
  '7633': 'Pécs',
  '7634': 'Pécs',
  '7635': 'Pécs',
  '7700': 'Mohács',
  '7800': 'Siklós',
  '7900': 'Szigetvár',
  '8000': 'Székesfehérvár',
  '8060': 'Mór',
  '8100': 'Várpalota',
  '8200': 'Veszprém',
  '8220': 'Balatonalmádi',
  '8230': 'Balatonfüred',
  '8300': 'Tapolca',
  '8360': 'Keszthely',
  '8380': 'Hévíz',
  '8400': 'Ajka',
  '8500': 'Pápa',
  '8600': 'Siófok',
  '8700': 'Marcali',
  '8800': 'Nagykanizsa',
  '8900': 'Zalaegerszeg',
  '9000': 'Győr',
  '9012': 'Győr',
  '9021': 'Győr',
  '9022': 'Győr',
  '9023': 'Győr',
  '9024': 'Győr',
  '9025': 'Győr',
  '9026': 'Győr',
  '9027': 'Győr',
  '9028': 'Győr',
  '9029': 'Győr',
  '9030': 'Győr',
  '9100': 'Tét',
  '9200': 'Mosonmagyaróvár',
  '9300': 'Csorna',
  '9400': 'Sopron',
  '9500': 'Celldömölk',
  '9600': 'Sárvár',
  '9700': 'Szombathely',
  '9721': 'Gencsapáti',
  '9730': 'Kőszeg',
  '9800': 'Vasvár',
  '9900': 'Körmend',
  '9970': 'Szentgotthárd',
};

interface RegisterFormProps {
  onSwitch: () => void;
}

export default function RegisterForm({ onSwitch }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
    isCompany: false,
    companyName: '',
    taxNumber: '',
    postalCode: '',
    city: '',
    address: '',
    gdprAccepted: false,
    newsletterConsent: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (formData.postalCode.length === 4) {
      const city = postalCodeMap[formData.postalCode];
      if (city) {
        setFormData(prev => ({ ...prev, city }));
      }
    }
  }, [formData.postalCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.name || !formData.phone) {
      setError('Kérjük töltsd ki az összes kötelező mezőt');
      return;
    }

    if (formData.password.length < 6) {
      setError('A jelszónak legalább 6 karakter hosszúnak kell lennie');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('A két jelszó nem egyezik');
      return;
    }

    if (!formData.gdprAccepted) {
      setError('Az adatkezelési tájékoztató elfogadása kötelező');
      return;
    }

    if (formData.isCompany) {
      if (!formData.companyName || !formData.taxNumber || !formData.postalCode || !formData.city) {
        setError('Cég esetén minden céges adat megadása kötelező');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Ez az email cím már regisztrálva van');
        } else {
          setError(authError.message);
        }
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            name: formData.name,
            phone: formData.phone,
            is_company: formData.isCompany,
            company_name: formData.isCompany ? formData.companyName : null,
            tax_number: formData.isCompany ? formData.taxNumber : null,
            postal_code: formData.isCompany ? formData.postalCode : null,
            city: formData.isCompany ? formData.city : null,
            address: formData.isCompany ? formData.address : null,
            role: 'customer',
            partner_discount: 0,
            newsletter_consent: formData.newsletterConsent,
            newsletter_consent_date: formData.newsletterConsent ? new Date().toISOString() : null,
          });

        if (profileError) {
          console.error('Profile error:', profileError);
        }

        setSuccess(true);
      }
    } catch (err) {
      setError('Hiba történt a regisztráció során');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-green-600 text-5xl mb-4">✓</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Sikeres regisztráció!</h3>
        <p className="text-gray-600 mb-4">
          Kérjük, ellenőrizd az email fiókodat és kattints a megerősítő linkre.
        </p>
        <button
          onClick={onSwitch}
          className="text-brand-600 hover:text-brand-700 font-semibold"
        >
          Vissza a belépéshez
        </button>
      </div>
    );
  }

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );

  const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Név */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Teljes név <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          placeholder="Vezetéknév Keresztnév"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email cím <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          placeholder="pelda@email.com"
        />
      </div>

      {/* Telefon */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Telefonszám <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          placeholder="+36 70 123 4567"
        />
      </div>

      {/* Jelszó */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Jelszó <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors pr-12"
            placeholder="Minimum 6 karakter"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      {/* Jelszó megerősítés */}
      <div>
        <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
          Jelszó megerősítése <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPasswordConfirm ? "text" : "password"}
            id="passwordConfirm"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors pr-12"
            placeholder="Jelszó újra"
          />
          <button
            type="button"
            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPasswordConfirm ? <EyeSlashIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      {/* Céges checkbox */}
      <div className="flex items-center gap-2 py-2">
        <input
          type="checkbox"
          id="isCompany"
          name="isCompany"
          checked={formData.isCompany}
          onChange={handleChange}
          className="w-5 h-5 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
        />
        <label htmlFor="isCompany" className="text-sm font-medium text-gray-700">
          Cégként regisztrálok
        </label>
      </div>

      {/* Céges adatok */}
      {formData.isCompany && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
              Cégnév <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              placeholder="Cég neve"
            />
          </div>

          <div>
            <label htmlFor="taxNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Adószám <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="taxNumber"
              name="taxNumber"
              value={formData.taxNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              placeholder="12345678-1-23"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                Irányítószám <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                placeholder="1234"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Település <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                placeholder="Település"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Cím (utca, házszám)
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              placeholder="Utca, házszám"
            />
          </div>
        </div>
      )}

      {/* GDPR checkbox */}
      <div className="flex items-start gap-2 py-2">
        <input
          type="checkbox"
          id="gdprAccepted"
          name="gdprAccepted"
          checked={formData.gdprAccepted}
          onChange={handleChange}
          required
          className="w-5 h-5 mt-0.5 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
        />
        <label htmlFor="gdprAccepted" className="text-sm text-gray-600">
          Elolvastam és elfogadom az{' '}
          <a href="/adatkezelesi-tajekoztato" target="_blank" className="text-brand-600 hover:underline">
            Adatkezelési tájékoztatót
          </a>{' '}
          <span className="text-red-500">*</span>
        </label>
      </div>

      {/* Hírlevél checkbox */}
      <div className="flex items-start gap-2 py-2">
        <input
          type="checkbox"
          id="newsletterConsent"
          name="newsletterConsent"
          checked={formData.newsletterConsent}
          onChange={handleChange}
          className="w-5 h-5 mt-0.5 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
        />
        <label htmlFor="newsletterConsent" className="text-sm text-gray-600">
          Szeretnék értesülni az akciókról, újdonságokról és szakmai tartalmakról.
        </label>
      </div>

      {/* Regisztráció gomb */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Regisztráció...' : 'Regisztráció'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Már van fiókod?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-brand-600 hover:text-brand-700 font-semibold"
        >
          Jelentkezz be
        </button>
      </p>
    </form>
  );
}