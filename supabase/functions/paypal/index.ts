
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase client setup with environment variables
const supabaseClient = (req: Request) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const authHeader = req.headers.get('Authorization');
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader || '' } },
    auth: { persistSession: false }
  });
};

// PayPal API configuration
const PAYPAL_BASE_URL = Deno.env.get('PAYPAL_MODE') === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Generate PayPal access token
async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID') || '';
  const clientSecret = Deno.env.get('PAYPAL_SECRET_KEY') || '';
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are missing');
  }

  console.log('Generating PayPal access token...');
  const auth = btoa(`${clientId}:${clientSecret}`);
  
  try {
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('PayPal token error:', errorData);
      throw new Error(`PayPal token error: ${response.status}`);
    }

    const data = await response.json();
    console.log('PayPal token generated successfully');
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal token:', error);
    throw error;
  }
}

// Create a PayPal order
async function createPayPalOrder(amount: number, currency: string): Promise<any> {
  const accessToken = await getPayPalAccessToken();
  
  console.log(`Creating PayPal order for ${amount} ${currency}...`);
  try {
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toString(),
          },
        }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('PayPal create order error:', errorData);
      throw new Error(`PayPal create order error: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('PayPal order created successfully:', responseData.id);
    return responseData;
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw error;
  }
}

// Capture a PayPal payment
async function capturePayPalPayment(orderId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken();
  
  console.log(`Capturing PayPal payment for order ${orderId}...`);
  try {
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('PayPal capture payment error:', errorData);
      throw new Error(`PayPal capture payment error: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('PayPal payment captured successfully:', responseData.id);
    return responseData;
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    throw error;
  }
}

// Handle HTTP requests
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    
    console.log(`Processing ${req.method} request to ${path}`);
    
    // Create order endpoint
    if (path === 'create-order' && req.method === 'POST') {
      const { amount, currency = 'USD', userId, projectId } = await req.json();
      
      if (!amount || !userId || !projectId) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const orderData = await createPayPalOrder(amount, currency);
      
      // Store the pending payment in the database
      const supabase = supabaseClient(req);
      const { error: dbError } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          project_id: projectId,
          amount,
          currency,
          payment_id: orderData.id,
          status: 'pending',
        });
      
      if (dbError) {
        console.error('Error storing payment record:', dbError);
      }
      
      return new Response(
        JSON.stringify(orderData),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Capture payment endpoint
    if (path === 'capture-payment' && req.method === 'POST') {
      const { orderId } = await req.json();
      
      if (!orderId) {
        return new Response(
          JSON.stringify({ error: 'Order ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const captureData = await capturePayPalPayment(orderId);
      
      // Update the payment status in the database
      const supabase = supabaseClient(req);
      const { error: dbError } = await supabase
        .from('payments')
        .update({
          status: captureData.status === 'COMPLETED' ? 'completed' : captureData.status.toLowerCase(),
          updated_at: new Date().toISOString(),
        })
        .eq('payment_id', orderId);
      
      if (dbError) {
        console.error('Error updating payment record:', dbError);
      }
      
      return new Response(
        JSON.stringify(captureData),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // If path is not recognized
    return new Response(
      JSON.stringify({ error: 'Not Found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('PayPal function error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
