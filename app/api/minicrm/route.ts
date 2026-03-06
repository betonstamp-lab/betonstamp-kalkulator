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
    const headers = {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };

    // 1. Kontakt létrehozása
    const contactData = {
      Type: 'Person',
      FirstName: body.firstName || '',
      LastName: body.lastName || '',
      Email: body.email,
      Phone: body.phone || '',
    };

    console.log('MiniCRM contact request:', JSON.stringify(contactData));

    const contactResponse = await fetch('https://r3.minicrm.hu/Api/R3/Contact', {
      method: 'PUT',
      headers,
      body: JSON.stringify(contactData),
    });

    const contactText = await contactResponse.text();
    console.log('MiniCRM contact response:', contactResponse.status, contactText);

    let contactResult;
    try {
      contactResult = JSON.parse(contactText);
    } catch {
      console.error('MiniCRM contact non-JSON:', contactText);
      return NextResponse.json({ error: 'MiniCRM contact error', details: contactText }, { status: 500 });
    }

    if (!contactResponse.ok || !contactResult.Id) {
      return NextResponse.json({ error: 'MiniCRM contact error', details: contactResult }, { status: 500 });
    }

    const contactId = contactResult.Id;

    // 2. Ha cég van, létrehozzuk a céget és hozzárendeljük a kontaktot
    let businessId = null;
    if (body.companyName) {
      const businessData = {
        Type: 'Business',
        Name: body.companyName,
      };

      const businessResponse = await fetch('https://r3.minicrm.hu/Api/R3/Contact', {
        method: 'PUT',
        headers,
        body: JSON.stringify(businessData),
      });

      const businessText = await businessResponse.text();
      console.log('MiniCRM business response:', businessResponse.status, businessText);

      try {
        const businessResult = JSON.parse(businessText);
        if (businessResult.Id) {
          businessId = businessResult.Id;
          // Kontakt hozzárendelése a céghez
          await fetch(`https://r3.minicrm.hu/Api/R3/Contact/${contactId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ BusinessId: businessId }),
          });
        }
      } catch {
        console.error('MiniCRM business error:', businessText);
      }
    }

    // 3. Adatlap (projekt) létrehozása az Értékesítés modulban
    const projectData: Record<string, any> = {
      CategoryId: 70,
      ContactId: contactId,
      StatusId: 3687,
      Name: `${body.lastName} ${body.firstName} - Kalkulátor regisztráció`,
      Vezeteknev: body.lastName || '',
      Keresztnev: body.firstName || '',
      EmailCim: body.email || '',
      Telefonszam: body.phone || '',
      Varos: body.city || '',
    };

    if (businessId) {
      projectData.BusinessId = businessId;
    }

    console.log('MiniCRM project request:', JSON.stringify(projectData));

    const projectResponse = await fetch('https://r3.minicrm.hu/Api/R3/Project', {
      method: 'PUT',
      headers,
      body: JSON.stringify(projectData),
    });

    const projectText = await projectResponse.text();
    console.log('MiniCRM project response:', projectResponse.status, projectText);

    let projectResult;
    try {
      projectResult = JSON.parse(projectText);
    } catch {
      console.error('MiniCRM project non-JSON:', projectText);
    }

    return NextResponse.json({ 
      success: true, 
      contactId, 
      projectId: projectResult?.Id,
      newsletterConsent: body.newsletterConsent,
    });
  } catch (error) {
    console.error('MiniCRM integration error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}