'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Marca, Modelo, Estado, Auto } from '@/types';

export default function EditarAuto() {
  console.log('🚀 Componente EditarAuto renderizándose');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Editar Auto</h1>
          <p className="text-white">Componente básico funcionando</p>
        </div>
      </div>
    </div>
  );
}