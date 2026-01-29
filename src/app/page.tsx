'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function LandingPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    email: '',
    mensaje: ''
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCatalogoModalOpen, setIsCatalogoModalOpen] = useState(false);

  // Ref para la sección de características
  const featuresRef = useRef(null);
  const isFeaturesInView = useInView(featuresRef, { once: true, margin: "-50px", amount: 0.3 });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el formulario
    console.log('Formulario enviado:', formData);
    alert('Gracias por tu interés. Te contactaremos pronto.');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <nav className="bg-gray-900 shadow-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                ConcesionariosCloud
              </h1>
            </div>
            <div className="flex items-center">
              {/* Desktop menu */}
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  href="/demo"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Demo
                </Link>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">
                  Solicitar Acceso
                </button>
              </div>
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-300 hover:text-white p-2"
                  aria-label="Toggle menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900 border-t border-gray-700">
                <Link
                  href="/demo"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Demo
                </Link>
                <button
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-left w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Solicitar Acceso
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <motion.section 
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-16 md:py-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h1 
            className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            ConcesionariosCloud
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-gray-300 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Plataforma cloud para concesionarias: catálogo online, gestión de leads y pricing inteligente.
          </motion.p>
          <motion.p 
            className="text-base md:text-lg text-gray-400 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Infraestructura en la nube para digitalizar concesionarias sin instalar servidores ni software local.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link
              href="/demo"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 rounded-lg font-medium text-base md:text-lg transition-all duration-200 transform hover:scale-105 shadow-xl"
            >
              Ver Demo
            </Link>
            <button className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-6 md:px-8 py-3 rounded-lg font-medium text-base md:text-lg transition-all duration-200 shadow-lg">
              Solicitar Acceso
            </button>
          </motion.div>
       
        </div>
      </motion.section>
   <div className="h-1 bg-gradient-to-r from-blue-600 via-red-600 to-blue-600"></div>
      {/* PROBLEMA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">Cómo funciona hoy</h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Inventario, clientes y precios suelen gestionarse en sistemas separados.<br />
            ConcesionariosCloud unifica todo en una sola plataforma en la nube.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section ref={featuresRef} className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Características</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow-lg border border-blue-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              onClick={() => setIsCatalogoModalOpen(true)}
            >
              <motion.div
                className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4"
                initial={{ scale: 0 }}
                animate={isFeaturesInView ? { scale: 1 } : { scale: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </motion.div>
              <motion.h3
                className="text-xl font-semibold text-gray-900 mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                Catálogo Online
              </motion.h3>
              <motion.p
                className="text-gray-600"
                initial={{ opacity: 0, y: 10 }}
                animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                Catálogo digital con filtros avanzados, stock actualizado en tiempo real y páginas individuales por concesionario.
              </motion.p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg shadow-lg border border-green-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
              <motion.div
                className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4"
                initial={{ scale: 0 }}
                animate={isFeaturesInView ? { scale: 1 } : { scale: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </motion.div>
              <motion.h3
                className="text-xl font-semibold text-gray-900 mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                Gestión de Clientes y Oportunidades
              </motion.h3>
              <motion.p
                className="text-gray-600"
                initial={{ opacity: 0, y: 10 }}
                animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                Captura, seguimiento y calificación automática de clientes potenciales durante todo el proceso de venta.
              </motion.p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-lg shadow-lg border border-purple-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            >
              <motion.div
                className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4"
                initial={{ scale: 0 }}
                animate={isFeaturesInView ? { scale: 1 } : { scale: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </motion.div>
              <motion.h3
                className="text-xl font-semibold text-gray-900 mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                Estrategia de Precios Inteligente
              </motion.h3>
              <motion.p
                className="text-gray-600"
                initial={{ opacity: 0, y: 10 }}
                animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                Modelo de precios basado en datos para optimizar rotación de inventario y márgenes comerciales.
              </motion.p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-lg shadow-lg border border-red-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            >
              <motion.div
                className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4"
                initial={{ scale: 0 }}
                animate={isFeaturesInView ? { scale: 1 } : { scale: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </motion.div>
              <motion.h3
                className="text-xl font-semibold text-gray-900 mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                Analítica y Métricas
              </motion.h3>
              <motion.p
                className="text-gray-600"
                initial={{ opacity: 0, y: 10 }}
                animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                Paneles de control con métricas de ventas, clientes e inventario para toma de decisiones operativas.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white relative overflow-hidden">
        {/* Map-like background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-blue-400 rounded-full"></div>
          <div className="absolute top-20 right-20 w-24 h-24 border border-blue-300 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 border border-blue-500 rounded-full"></div>
          <div className="absolute bottom-10 right-1/3 w-20 h-20 border border-blue-400 rounded-full"></div>
          {/* Connecting lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M10,15 Q30,25 50,20 T90,30" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="0.5" fill="none" strokeDasharray="2,2"/>
            <path d="M15,40 Q35,35 55,45 T85,40" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="0.3" fill="none" strokeDasharray="1,1"/>
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Nuestro Camino 2026</h2>
            <p className="text-xl text-gray-300">Descubre el viaje que transformará la industria automotriz</p>
          </motion.div>

          {/* Roadmap Path */}
          <div className="relative">
            {/* Main path line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 rounded-full hidden md:block"></div>

            <div className="space-y-16 md:space-y-24">
              {/* Q1 */}
              <motion.div
                className="flex flex-col md:flex-row items-center md:justify-between"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="md:w-1/2 md:pr-8 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
                    <span className="text-white font-bold text-lg">Q1</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Fundamentos Sólidos</h3>
                  <p className="text-gray-300 text-lg">Core platform (catálogo + leads)</p>
                  <p className="text-gray-400 mt-2">Establecemos las bases con un catálogo digital robusto y sistema de captación de leads inteligente.</p>
                </div>
                <div className="md:w-1/2 md:pl-8 mt-6 md:mt-0">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                      <span className="text-green-400 font-medium">Completado</span>
                    </div>
                    <p className="text-gray-300">Sistema de catálogo online con filtros avanzados y gestión de leads automatizada.</p>
                  </div>
                </div>
              </motion.div>

              {/* Q2 */}
              <motion.div
                className="flex flex-col md:flex-row-reverse items-center md:justify-between"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="md:w-1/2 md:pl-8 text-center md:text-right">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mb-4 shadow-lg">
                    <span className="text-white font-bold text-lg">Q2</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Multi-Tenant Revolution</h3>
                  <p className="text-gray-300 text-lg">Multi-tenant isolation</p>
                  <p className="text-gray-400 mt-2">Cada concesionaria obtiene su propio espacio seguro y personalizado.</p>
                </div>
                <div className="md:w-1/2 md:pr-8 mt-6 md:mt-0">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                      <span className="text-yellow-400 font-medium">En Desarrollo</span>
                    </div>
                    <p className="text-gray-300">Arquitectura de aislamiento completo para múltiples concesionarias en una sola plataforma.</p>
                  </div>
                </div>
              </motion.div>

              {/* Q3 */}
              <motion.div
                className="flex flex-col md:flex-row items-center md:justify-between"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="md:w-1/2 md:pr-8 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-4 shadow-lg">
                    <span className="text-white font-bold text-lg">Q3</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Inteligencia Artificial</h3>
                  <p className="text-gray-300 text-lg">AI pricing models</p>
                  <p className="text-gray-400 mt-2">Modelos de precios inteligentes basados en datos y machine learning.</p>
                </div>
                <div className="md:w-1/2 md:pl-8 mt-6 md:mt-0">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                      <span className="text-blue-400 font-medium">Próximo</span>
                    </div>
                    <p className="text-gray-300">Sistema de pricing dinámico que optimiza márgenes y acelera la rotación de inventario.</p>
                  </div>
                </div>
              </motion.div>

              {/* Q4 */}
              <motion.div
                className="flex flex-col md:flex-row-reverse items-center md:justify-between"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="md:w-1/2 md:pl-8 text-center md:text-right">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-4 shadow-lg">
                    <span className="text-white font-bold text-lg">Q4</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Analytics Avanzado</h3>
                  <p className="text-gray-300 text-lg">Dealer analytics dashboard</p>
                  <p className="text-gray-400 mt-2">Paneles de control completos con métricas detalladas y insights accionables.</p>
                </div>
                <div className="md:w-1/2 md:pr-8 mt-6 md:mt-0">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                      <span className="text-gray-400 font-medium">Planificado</span>
                    </div>
                    <p className="text-gray-300">Dashboard completo con KPIs de ventas, rendimiento de inventario y análisis predictivo.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Call to action */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-300 text-lg mb-6">¿Quieres ser parte de esta transformación?</p>
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              Únete al Viaje
            </button>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Solicitar Demo Privada</h2>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
            <input
              type="text"
              name="empresa"
              placeholder="Empresa"
              value={formData.empresa}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
            <textarea
              name="mensaje"
              placeholder="Mensaje"
              value={formData.mensaje}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            ></textarea>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Enviar
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 mb-4 md:mb-0">
              © 2026 ConcesionariosCloud<br />
              Cloud-native SaaS platform for car dealerships.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-white">GitHub</a>
              <Link href="/demo" className="text-gray-300 hover:text-white">Demo</Link>
              <a href="#" className="text-gray-300 hover:text-white">Contacto</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Catálogo Online */}
      {isCatalogoModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsCatalogoModalOpen(false)}
        >
          <motion.div
            className="bg-white rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-200"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 to-black/20"></div>
              <div className="relative z-10 flex justify-between items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h2 className="text-4xl font-bold mb-2 tracking-tight">Catálogo Online</h2>
                  <p className="text-gray-300 text-lg">Vista previa del sistema de catálogo digital profesional</p>
                </motion.div>
                <motion.button
                  onClick={() => setIsCatalogoModalOpen(false)}
                  className="text-white hover:text-gray-300 transition-all duration-200 p-3 rounded-full hover:bg-white/10 hover:scale-110"
                  aria-label="Cerrar modal"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-4 md:p-8 max-h-[60vh] md:max-h-none overflow-y-auto">
              <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
                {/* Imagen de muestra */}
                <motion.div
                  className="flex-1"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 md:p-6 shadow-lg border border-gray-200">
                    <div className="text-center text-gray-600 mb-4 md:mb-6">
                      <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-2">Vista Previa del Catálogo</h4>
                      <p className="text-xs md:text-sm text-gray-500">Interfaz moderna y profesional</p>
                    </div>
                    <div className="relative w-full h-48 md:h-80 rounded-xl overflow-hidden shadow-xl border border-gray-200">
                      <Image
                        src="/img/catalogo-preview.jpg"
                        alt="Vista previa del catálogo de autos"
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>
                </motion.div>

                {/* Descripción */}
                <motion.div
                  className="flex-1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">¿Qué es el Catálogo Online?</h3>
                  <div className="space-y-4 md:space-y-6 text-gray-700">
                    <p className="text-base md:text-lg leading-relaxed">
                      Nuestro catálogo online es una plataforma digital completa que permite a las concesionarias
                      mostrar su inventario de manera profesional y atractiva para los clientes potenciales.
                    </p>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 md:p-6 rounded-xl border-l-4 border-blue-500 shadow-sm">
                      <h4 className="text-lg md:text-xl font-semibold text-blue-900 mb-3 md:mb-4">Características Principales:</h4>
                      <div className="space-y-3 text-blue-800">
                        <motion.div
                          className="flex items-center"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.5 }}
                        >
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="font-medium">Filtros avanzados por marca, modelo, precio y características</span>
                        </motion.div>
                        <motion.div
                          className="flex items-center"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.6 }}
                        >
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="font-medium">Stock actualizado en tiempo real</span>
                        </motion.div>
                        <motion.div
                          className="flex items-center"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.7 }}
                        >
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="font-medium">Páginas individuales personalizadas por concesionario</span>
                        </motion.div>
                        <motion.div
                          className="flex items-center"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.8 }}
                        >
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="font-medium">Galería de imágenes de alta calidad</span>
                        </motion.div>
                      </div>
                    </div>

                    <motion.p
                      className="text-lg leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.9 }}
                    >
                      Cada concesionario tiene su propio espacio personalizado donde puede gestionar su inventario,
                      actualizar precios y mostrar sus vehículos de manera profesional, aumentando significativamente
                      la conversión de visitantes en clientes potenciales.
                    </motion.p>
                  </div>

                  <motion.div
                    className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-3 md:gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href="/demo"
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 shadow-lg hover:shadow-xl block text-center"
                        onClick={() => setIsCatalogoModalOpen(false)}
                      >
                        Ver Demo Completa
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <button
                        onClick={() => setIsCatalogoModalOpen(false)}
                        className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        Cerrar
                      </button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

