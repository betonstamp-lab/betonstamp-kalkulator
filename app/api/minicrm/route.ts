import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const systemId = process.env.MINICRM_SYSTEM_ID;
    const apiKey = process.env.MINICRM_API_KEY;
    
    if (!systemId || !apiKey) {
      console.error('MiniCRM credentials missing');
      return NextResponse.json({ error: 'MiniCRM not configured' }, { status: 500 });
    }

    const credentials = Buffer.from(`${systemId}:${apiKey}`).toString('base64');

    const response = await fetch(`https://r3.minicrm.hu/Api/R3/Contact`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        FirstName: body.firstName || '',
        LastName: body.lastName || '',
        Email: body.email,
        Phone: body.phone || '',
        BusinessName: body.companyName || '',
        City: body.city || '',
        Description: 'Mikrocement Kalkulátor regisztráció',
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('MiniCRM error:', data);
      return NextResponse.json({ error: 'MiniCRM error', details: data }, { status: response.status });
    }

    return NextResponse.json({ success: true, contactId: data.Id });
  } catch (error) {
    console.error('MiniCRM integration error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}