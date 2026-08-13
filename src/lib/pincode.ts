// Free API: postalpincode.in — used client-side for autofill
export async function lookupPincode(pin: string): Promise<{ state: string; city: string; district: string } | null> {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, { cache: 'force-cache' });
    const data = await res.json();
    if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.[0]) {
      const po = data[0].PostOffice[0];
      return { state: po.State, city: po.District, district: po.District };
    }
  } catch {}
  return null;
}



