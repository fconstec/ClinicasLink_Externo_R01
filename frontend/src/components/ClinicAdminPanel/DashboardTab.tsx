import React, { useState, useMemo } from 'react';
import { Calendar, Users, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Appointment, Professional, Service } from '@/components/ClinicAdminPanel_Managers/types';
import { toZonedTime, fromZonedTime, format as formatDateFns } from 'date-fns-tz';
import { parseISO } from 'date-fns';

export interface DashboardProps {
  appointments: Appointment[];
  professionals: Professional[];
  services: Service[];
}

type Period = 'week' | 'month' | 'year' | 'max';

function getAppointmentsByDate(appointments: Appointment[], period: Period) {
  if (!appointments || appointments.length === 0) return [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDate: Date;
  switch (period) {
    case 'week':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      break;
    case 'month':
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date(today);
      startDate.setFullYear(today.getFullYear() - 1);
      break;
    case 'max':
    default:
      const validAppointmentDates = appointments
        .map(a => {
          try {
            return parseISO(a.date + 'T' + (a.time || '00:00:00')).getTime();
          } catch {
            return NaN;
          }
        })
        .filter(t => !isNaN(t));
      if (validAppointmentDates.length === 0) {
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
      } else {
        startDate = new Date(Math.min(...validAppointmentDates));
      }
      break;
  }
  startDate.setHours(0, 0, 0, 0);

  const counts: Record<string, number> = {};
  appointments.forEach(app => {
    try {
      const appDateObj = parseISO(app.date + 'T' + (app.time || '00:00:00'));
      const appDateOnly = new Date(appDateObj.getFullYear(), appDateObj.getMonth(), appDateObj.getDate());

      if (appDateOnly >= startDate && appDateOnly <= today) {
        const dateKey = appDateOnly.toISOString().split('T')[0];
        counts[dateKey] = (counts[dateKey] || 0) + 1;
      }
    } catch {
      // ignora
    }
  });

  const daysInRange: string[] = [];
  let currentDate = new Date(startDate);
  while (currentDate <= today) {
    daysInRange.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return daysInRange.map(dateKey => ({
    date: dateKey,
    count: counts[dateKey] || 0
  }));
}

const periodLabels: Record<Period, string> = {
  week: 'Semana',
  month: 'Mês',
  year: 'Ano',
  max: 'Máx'
};

const Dashboard: React.FC<DashboardProps> = ({ appointments, professionals, services }) => {
  const [chartPeriod, setChartPeriod] = useState<Period>('month');
  const chartData = getAppointmentsByDate(appointments, chartPeriod);

  const timeZone = 'America/Sao_Paulo';

  const upcomingAppointments = useMemo(() => {
    const nowInUtc = new Date();

    return appointments
      .map(appointment => {
        const appointmentDateTimeString = `${appointment.date}T${appointment.time || '00:00'}:00`;
        let appointmentUtcDateTime: Date;
        try {
          appointmentUtcDateTime = fromZonedTime(appointmentDateTimeString, timeZone);
        } catch (error) {
          console.error(`Erro ao parsear data/hora do agendamento ID ${appointment.id}: ${appointmentDateTimeString}`, error);
          return null;
        }

        return {
          ...appointment,
            // utcDateTime calculado em UTC
          utcDateTime: appointmentUtcDateTime
        };
      })
      .filter(
        (appointment): appointment is Appointment & { utcDateTime: Date } =>
          !!appointment &&
          appointment.utcDateTime >= nowInUtc &&
          appointment.status !== 'cancelled' &&
          appointment.status !== 'completed'
      )
      .sort((a, b) => a.utcDateTime.getTime() - b.utcDateTime.getTime())
      .slice(0, 5);
  }, [appointments, timeZone]);

  const fillerRowCount = Math.max(0, 5 - upcomingAppointments.length);

  const cardClasses = "bg-white rounded-xl shadow-md border border-gray-100 p-6";

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className={cardClasses}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Agendamentos</h3>
            <Calendar className="h-8 w-8 text-rose-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{appointments.length}</p>
          <p className="text-sm text-gray-500 mt-2">Total de agendamentos</p>
        </div>
        <div className={cardClasses}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Profissionais</h3>
            <Users className="h-8 w-8 text-sky-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{professionals.length}</p>
          <p className="text-sm text-gray-500 mt-2">Profissionais cadastrados</p>
        </div>
        <div className={cardClasses}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Serviços</h3>
            <FileText className="h-8 w-8 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{services.length}</p>
          <p className="text-sm text-gray-500 mt-2">Serviços oferecidos</p>
        </div>
      </div>

      {/* Próximos Agendamentos */}
      <div className={cardClasses}>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Próximos Agendamentos (Máx. 5)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profissional</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora (São Paulo)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingAppointments.map((appointment) => {
                const zonedAppDateTime = toZonedTime(appointment.utcDateTime, timeZone);
                const displayDate = formatDateFns(zonedAppDateTime, 'dd/MM/yyyy', { timeZone });
                const displayTime = formatDateFns(zonedAppDateTime, 'HH:mm', { timeZone });

                return (
                  <tr key={appointment.id} className="hover:bg-gray-50/70">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{appointment.patientName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{appointment.patientPhone || ''}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {appointment.serviceName || (appointment as any).service || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {appointment.professionalName ||
                          professionals.find(p => p.id === appointment.professionalId)?.name ||
                          "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{displayDate}</div>
                      <div className="text-sm text-gray-500">{displayTime}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          appointment.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : appointment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : appointment.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {appointment.status === 'confirmed'
                          ? 'Confirmado'
                          : appointment.status === 'pending'
                          ? 'Pendente'
                          : appointment.status === 'completed'
                          ? 'Concluído'
                          : 'Cancelado'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {fillerRowCount > 0 &&
                Array.from({ length: fillerRowCount }).map((_, i) => (
                  <tr key={`filler-${i}`}>
                    <td
                      className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-400 h-[65px]"
                      colSpan={5}
                    >
                      – Nenhum agendamento futuro adicional –
                    </td>
                  </tr>
                ))}
              {upcomingAppointments.length === 0 && fillerRowCount === 0 && (
                <tr>
                  <td
                    className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500 h-[65px]"
                    colSpan={5}
                  >
                    Nenhum agendamento futuro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico */}
      <div className={cardClasses}>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
          <h3 className="text-lg font-semibold text-gray-700">Agendamentos x Tempo</h3>
          <div className="flex gap-2 flex-wrap">
            {(['week', 'month', 'year', 'max'] as Period[]).map((period) => (
              <button
                key={period}
                className={`px-3 py-1 text-sm rounded-md border ${
                  chartPeriod === period
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-white text-rose-500 border-rose-500 hover:bg-rose-50'
                } transition-colors duration-150`}
                onClick={() => setChartPeriod(period)}
              >
                {periodLabels[period]}
              </button>
            ))}
          </div>
        </div>
        <div style={{ width: '100%', height: 320 }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={dateStr => {
                    try {
                      return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short'
                      });
                    } catch {
                      return dateStr;
                    }
                  }}
                  fontSize={12}
                  tick={{ fill: '#666' }}
                />
                <YAxis allowDecimals={false} fontSize={12} tick={{ fill: '#666' }} />
                <Tooltip
                  labelFormatter={(label) => {
                    try {
                      return 'Data: ' + new Date(label + 'T00:00:00Z').toLocaleDateString('pt-BR');
                    } catch {
                      return label;
                    }
                  }}
                  formatter={(value: number) => [`${value} agend.`, 'Total']}
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '0.5rem', borderColor: '#ccc' }}
                  itemStyle={{ color: '#e11d48' }}
                  labelStyle={{ color: '#333', fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#e11d48"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 1, fill: '#e11d48' }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#e11d48' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              {appointments.length > 0
                ? 'Nenhum dado para o período selecionado.'
                : 'Nenhum agendamento para exibir no gráfico.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;