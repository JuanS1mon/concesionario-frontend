import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const params = url.searchParams.toString();
    const backendUrl = `http://localhost:8004/market/search?${params}`;
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const text = await response.text();
    // Intenta parsear como JSON, si falla devuelve error controlado
    try {
      const data = text ? JSON.parse(text) : [];
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Respuesta inválida del backend', detail: text }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error al conectar con el backend' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
