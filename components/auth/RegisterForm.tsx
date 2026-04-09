'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/shared/supabase';
import { postalCodeMap } from '@/lib/shared/postalCodes';

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
          .upsert({
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
        // MiniCRM integráció
        try {
          const nameParts = formData.name.split(' ');
          const lastName = nameParts[0] || '';
          const firstName = nameParts.slice(1).join(' ') || '';
          
          await fetch('/api/minicrm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName,
              lastName,
              email: formData.email,
              phone: formData.phone,
              companyName: formData.isCompany ? formData.companyName : '',
              city: formData.city || '',
            newsletterConsent: formData.newsletterConsent,
            }),
          });
        } catch (crmError) {
          console.error('MiniCRM error:', crmError);
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