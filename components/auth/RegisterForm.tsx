'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface RegisterFormProps {
  onSwitch: () => void;
}

// Magyar irányítószámok és települések (leggyakoribbak)
const postalCodeMap: Record<string, string> = {
  '1011': 'Budapest I. kerület',
  '1051': 'Budapest V. kerület',
  '1061': 'Budapest VI. kerület',
  '1071': 'Budapest VII. kerület',
  '1081': 'Budapest VIII. kerület',
  '1091': 'Budapest IX. kerület',
  '1101': 'Budapest X. kerület',
  '1111': 'Budapest XI. kerület',
  '1121': 'Budapest XII. kerület',
  '1131': 'Budapest XIII. kerület',
  '1141': 'Budapest XIV. kerület',
  '1151': 'Budapest XV. kerület',
  '1161': 'Budapest XVI. kerület',
  '1171': 'Budapest XVII. kerület',
  '1181': 'Budapest XVIII. kerület',
  '1191': 'Budapest XIX. kerület',
  '1201': 'Budapest XX. kerület',
  '1211': 'Budapest XXI. kerület',
  '1221': 'Budapest XXII. kerület',
  '1231': 'Budapest XXIII. kerület',
  '2000': 'Szentendre',
  '2030': 'Érd',
  '2040': 'Budaörs',
  '2100': 'Gödöllő',
  '2600': 'Vác',
  '3000': 'Hatvan',
  '3300': 'Eger',
  '3500': 'Miskolc',
  '4000': 'Debrecen',
  '4400': 'Nyíregyháza',
  '5000': 'Szolnok',
  '5600': 'Békéscsaba',
  '6000': 'Kecskemét',
  '6700': 'Szeged',
  '7100': 'Szekszárd',
  '7400': 'Kaposvár',
  '7600': 'Pécs',
  '8000': 'Székesfehérvár',
  '8200': 'Veszprém',
  '8600': 'Siófok',
  '8900': 'Zalaegerszeg',
  '9000': 'Győr',
  '9400': 'Sopron',
  '9700': 'Szombathely',
};

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
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.name || !formData.phone) {
      setError('Kérjük töltsd ki az összes kötelező mezőt');
      return false;
    }
    if (formData.password.length < 6) {
      setError('A jelszónak legalább 6 karakter hosszúnak kell lennie');
      return false;
    }
    if (formData.password !== formData.passwordConfirm) {
      setError('A két jelszó nem egyezik');
      return false;
    }
    if (!formData.gdprAccepted) {
      setError('Az adatkezelési tájékoztató elfogadása kötelező');
      return false;
    }
    if (formData.isCompany) {
      if (!formData.companyName || !formData.taxNumber || !formData.postalCode || !formData.city || !formData.address) {
        setError('Cég esetén minden céges adat megadása kötelező');
        return false;
      }
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);

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
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Sikeres regisztráció!</h3>
        <p className="text-gray-600 mb-4">
          Kérjük erősítsd meg az email címedet a kiküldött levélben található linkre kattintva.
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

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          placeholder="Kovács János"
        />
      </div>

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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          placeholder="pelda@email.com"
        />
      </div>

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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          placeholder="+36 30 123 4567"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Jelszó <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          placeholder="Minimum 6 karakter"
        />
      </div>

      <div>
        <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
          Jelszó megerősítése <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="passwordConfirm"
          name="passwordConfirm"
          value={formData.passwordConfirm}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          placeholder="Jelszó újra"
        />
      </div>

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
          Cégként szeretnék regisztrálni
        </label>
      </div>

      {formData.isCompany && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4 border border-gray-200">
          <h4 className="font-semibold text-gray-800">Céges adatok</h4>
          
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Példa Kft."
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-gray-100"
                placeholder="Automatikusan kitöltődik"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Utca, házszám <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Példa utca 12."
            />
          </div>
        </div>
      )}

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
          Lépj be itt
        </button>
      </p>
    </form>
  );
}