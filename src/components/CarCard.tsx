'use client';

import { useState, useEffect, memo } from 'react';
import Image from 'next/image';
import { Auto } from '@/types';

interface CarCardProps {
  auto: Auto;
  onClick: () => void;
  onEdit?: (auto: Auto) => void;
  onDelete?: (id: number) => void;
}

const CarCard = memo(function CarCard({ auto, onClick, onEdit, onDelete }: CarCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Carousel automático solo cuando hay hover
  useEffect(() => {
    if (!isHovered || !auto.imagenes || auto.imagenes.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === auto.imagenes.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [auto.imagenes, isHovered]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === auto.imagenes.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? auto.imagenes.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const buildCloudinaryUrl = (url: string, options: { width?: number; quality?: number }) => {
    if (!url.includes('cloudinary.com') || !url.includes('/upload/')) {
      return url;
    }

    const transforms: string[] = [];
    if (options.width) {
      transforms.push(`w_${options.width}`);
    }
    if (options.quality) {
      transforms.push(`q_${options.quality}`);
    }
    transforms.push('f_auto');

    return url.replace('/upload/', `/upload/${transforms.join(',')}/`);
  };

  const imagenActual = auto.imagenes?.[currentImageIndex] || auto.imagenes?.[0];
  const imagenPrincipal = imagenActual 
    ? buildCloudinaryUrl(imagenActual.url, { width: 600, quality: 60 }) 
    : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3ESin Imagen%3C/text%3E%3C/svg%3E';

  return (
    <div
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-56 overflow-hidden">
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <Image
          src={imagenPrincipal}
          alt={`${auto.marca?.nombre} ${auto.modelo?.nombre}`}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
          onClick={onClick}
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setIsImageLoaded(true)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Controles de navegación invisibles */}
        {auto.imagenes && auto.imagenes.length > 1 && (
          <>
            <div
              className="absolute left-0 top-0 w-1/2 h-full cursor-pointer z-10"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              aria-label="Imagen anterior"
            />
            <div
              className="absolute right-0 top-0 w-1/2 h-full cursor-pointer z-10"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Imagen siguiente"
            />
          </>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Indicadores de imagen si hay múltiples */}
        {auto.imagenes && auto.imagenes.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {auto.imagenes.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goToImage(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          {!auto.en_stock && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              Agotado
            </span>
          )}
          {auto.en_stock && (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              Disponible
            </span>
          )}
        </div>

        {/* Price overlay on hover */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg">
            ${auto.precio.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {auto.marca?.nombre} {auto.modelo?.nombre}
            </h3>
            <p className="text-gray-600 font-medium">{auto.anio} • {auto.tipo}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-600">
              ${auto.precio.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">{auto.estado?.nombre}</div>
          </div>
        </div>

        {auto.descripcion && (
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
            {auto.descripcion}
          </p>
        )}

        <div className="flex justify-end items-center pt-4 border-t border-gray-100">
          {onEdit || onDelete ? (
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(auto);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium"
                >
                  Editar
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(auto.id);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium"
                >
                  Eliminar
                </button>
              )}
            </div>
          ) : (
            <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300 flex items-center" onClick={onClick}>
              <span className="mr-2">Ver detalles</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default CarCard;
