'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/app/components/Navbar';
import PrivateRoutes from '@/app/components/PrivateRoutes';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement);

interface ResumenVentasDTO {
  totalVentas: number;
  ingresosTotales: number;
  ticketPromedio: number;
}

interface TopPerfumeDTO {
  perfumeId: number;
  modelo: string;
  totalVendidos: number;
  ingresos: number;
}

interface VentasDiariasDTO {
  dia: string;
  totalVentas: number;
  ingresosTotales: number;
}

interface VentasMensualesDTO {
  anio: number;
  mes: number;
  totalVentas: number;
  ingresosTotales: number;
}

const EstadisticasVentas: React.FC = () => {
  const [startDate, setStartDate] = useState('2025-02-20T00:00:00');
  const [endDate, setEndDate] = useState('2025-03-20T23:59:59');
  const [resumen, setResumen] = useState<ResumenVentasDTO | null>(null);
  const [topPerfumes, setTopPerfumes] = useState<TopPerfumeDTO[]>([]);
  const [ventasDiarias, setVentasDiarias] = useState<VentasDiariasDTO[]>([]);
  const [ventasMensuales, setVentasMensuales] = useState<VentasMensualesDTO[]>([]);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setError('');
    try {
      const resumenResponse = await fetch(`https://wksolutions.somee.com/api/estadisticas/resumen?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
      const resumenData = await resumenResponse.json();
      setResumen(resumenData);

      const topResponse = await fetch(`https://wksolutions.somee.com/api/estadisticas/topperfumes?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&top=10`);
      const topData = await topResponse.json();
      setTopPerfumes(topData);

      const diariasResponse = await fetch(`https://wksolutions.somee.com/api/estadisticas/ventasdiarias?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
      const diariasData = await diariasResponse.json();
      setVentasDiarias(diariasData);

      const mensualesResponse = await fetch(`https://wksolutions.somee.com/api/estadisticas/ventasmensuales?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
      const mensualesData = await mensualesResponse.json();
      setVentasMensuales(mensualesData);
    } catch (err) {
      setError('Error al cargar los datos de estadísticas.');
    }
  };

  // Cargar datos al montar la página
  useEffect(() => {
    fetchData();
  }, []);

  // Configuración para el gráfico de Top Perfumes (Barras)
  const topPerfumesChartData = {
    labels: topPerfumes.map(item => item.modelo),
    datasets: [
      {
        label: 'Total Vendidos',
        data: topPerfumes.map(item => item.totalVendidos),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const topPerfumesChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Top 10 Perfumes Más Vendidos' },
    },
  };

  // Configuración para el gráfico de Ventas Diarias (Línea)
  const ventasDiariasChartData = {
    labels: ventasDiarias.map(item => item.dia),
    datasets: [
      {
        label: 'Ingresos Diarios',
        data: ventasDiarias.map(item => item.ingresosTotales),
        borderColor: 'rgba(255, 99, 132, 0.6)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const ventasDiariasChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Ventas Diarias' },
    },
  };

  // Configuración para el gráfico de Ventas Mensuales (Barras)
  const ventasMensualesChartData = {
    labels: ventasMensuales.map(item => `${item.anio}-${item.mes}`),
    datasets: [
      {
        label: 'Ingresos Mensuales',
        data: ventasMensuales.map(item => item.ingresosTotales),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const ventasMensualesChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Ventas Mensuales' },
    },
  };

  return (
    <PrivateRoutes>
      <Navbar />
      <div className="pt-32 p-4 bg-gray-800 min-h-screen">
        <h1 className="text-4xl font-bold text-center text-white mb-8">Estadísticas de Ventas</h1>

        {/* Filtro de Fechas */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Filtrar por Fecha</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-gray-800">Fecha de Inicio</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-800">Fecha de Finalización</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
            </div>
          </div>
          <button
            onClick={fetchData}
            className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded"
          >
            Filtrar
          </button>
          {error && <p className="text-center text-red-500 mt-4">{error}</p>}
        </div>

        {/* Resumen General */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Resumen General</h2>
          {resumen ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 border rounded">
                <p className="text-xl font-bold text-gray-800">{resumen.totalVentas}</p>
                <p className="text-gray-600">Ventas Totales</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-xl font-bold text-gray-800">${resumen.ingresosTotales.toFixed(2)}</p>
                <p className="text-gray-600">Ingresos Totales</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-xl font-bold text-gray-800">${resumen.ticketPromedio.toFixed(2)}</p>
                <p className="text-gray-600">Ticket Promedio</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-800">No se encontraron datos.</p>
          )}
        </div>

        {/* Gráfico: Top Perfumes Más Vendidos */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow mb-8">
          <Bar data={topPerfumesChartData} options={topPerfumesChartOptions} />
        </div>

        {/* Gráfico: Ventas Diarias */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow mb-8">
          <Line data={ventasDiariasChartData} options={ventasDiariasChartOptions} />
        </div>

        {/* Gráfico: Ventas Mensuales */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow mb-8">
          <Bar data={ventasMensualesChartData} options={ventasMensualesChartOptions} />
        </div>
      </div>
    </PrivateRoutes>
  );
};

export default EstadisticasVentas;
