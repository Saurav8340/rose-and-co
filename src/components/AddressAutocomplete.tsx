'use client';

import { useEffect, useState } from 'react';

interface AddressData {
  name: string;
  phone: string;
  pincode: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
}

interface Props {
  onChange: (data: AddressData) => void;
  initial?: Partial<AddressData>;
}

export default function AddressAutocomplete({ onChange, initial = {} }: Props) {
  const [data, setData] = useState<AddressData>({
    name: initial.name || '',
    phone: initial.phone || '',
    pincode: initial.pincode || '',
    address: initial.address || '',
    landmark: initial.landmark || '',
    city: initial.city || '',
    state: initial.state || '',
  });
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'loading' | 'ok' | 'invalid'>('idle');

  // Load saved address from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rc_last_address');
      if (saved && !initial.name) {
        const parsed = JSON.parse(saved) as AddressData;
        setData(parsed);
        onChange(parsed);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (field: keyof AddressData, value: string) => {
    const next = { ...data, [field]: value };
    setData(next);
    onChange(next);
    // Persist to localStorage for future visits
    if (field !== 'phone') {
      // don't persist phone until submit for privacy
      localStorage.setItem('rc_last_address', JSON.stringify({ ...next, phone: '' }));
    }
  };

  // Auto-fetch city/state from PIN code (Indian Postal API — free, public)
  useEffect(() => {
    const pin = data.pincode.trim();
    if (pin.length !== 6 || !/^[0-9]{6}$/.test(pin)) {
      setPincodeStatus('idle');
      return;
    }
    setPincodeStatus('loading');
    (async () => {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const json = await res.json();
        if (json[0]?.Status === 'Success' && json[0].PostOffice?.[0]) {
          const office = json[0].PostOffice[0];
          const city = office.District || office.Block || '';
          const state = office.State || '';
          setData((prev) => ({ ...prev, city, state }));
          onChange({ ...data, city, state });
          setPincodeStatus('ok');
        } else {
          setPincodeStatus('invalid');
        }
      } catch {
        setPincodeStatus('invalid');
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.pincode]);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-ivory/70 mb-1">Full name</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full border border-taupe/40 bg-blush/60 text-ivory placeholder:text-ivory/40 px-3 py-2 focus:border-wine focus:outline-none rounded"
            placeholder="Your full name"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-ivory/70 mb-1">Phone</label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => updateField('phone', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
            className="w-full border border-taupe/40 bg-blush/60 text-ivory placeholder:text-ivory/40 px-3 py-2 focus:border-wine focus:outline-none rounded"
            placeholder="10-digit mobile"
            autoComplete="tel"
            maxLength={10}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-ivory/70 mb-1">
          PIN code
          {pincodeStatus === 'loading' && <span className="ml-2 text-ivory/50">checking...</span>}
          {pincodeStatus === 'ok' && <span className="ml-2 text-crimson">✓ found</span>}
          {pincodeStatus === 'invalid' && <span className="ml-2 text-glow">not found</span>}
        </label>
        <input
          type="text"
          value={data.pincode}
          onChange={(e) => updateField('pincode', e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
          className="w-full md:w-48 border border-taupe/40 bg-blush/60 text-ivory placeholder:text-ivory/40 px-3 py-2 focus:border-wine focus:outline-none rounded"
          placeholder="6-digit PIN"
          autoComplete="postal-code"
          maxLength={6}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-ivory/70 mb-1">City</label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => updateField('city', e.target.value)}
            className="w-full border border-taupe/40 bg-blush/60 text-ivory placeholder:text-ivory/40 px-3 py-2 focus:border-wine focus:outline-none rounded"
            placeholder="Auto-filled from PIN"
            autoComplete="address-level2"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-ivory/70 mb-1">State</label>
          <input
            type="text"
            value={data.state}
            onChange={(e) => updateField('state', e.target.value)}
            className="w-full border border-taupe/40 bg-blush/60 text-ivory placeholder:text-ivory/40 px-3 py-2 focus:border-wine focus:outline-none rounded"
            placeholder="Auto-filled from PIN"
            autoComplete="address-level1"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-ivory/70 mb-1">Address</label>
        <textarea
          value={data.address}
          onChange={(e) => updateField('address', e.target.value)}
          rows={3}
          className="w-full border border-taupe/40 bg-blush/60 text-ivory placeholder:text-ivory/40 px-3 py-2 focus:border-wine focus:outline-none rounded"
          placeholder="House no., street, area"
          autoComplete="street-address"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-ivory/70 mb-1">Landmark (optional)</label>
        <input
          type="text"
          value={data.landmark}
          onChange={(e) => updateField('landmark', e.target.value)}
          className="w-full border border-taupe/40 bg-blush/60 text-ivory placeholder:text-ivory/40 px-3 py-2 focus:border-wine focus:outline-none rounded"
          placeholder="Near..."
        />
      </div>
    </div>
  );
}



