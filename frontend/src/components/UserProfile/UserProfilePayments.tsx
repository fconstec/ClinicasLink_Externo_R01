import React from 'react';

export interface Payment {
  id: number;
  clinicName: string;
  service: string;
  date: string;
  amount: string;
  method: string;
  status: string;
}

export interface UserProfilePaymentsProps {
  payments: Payment[];
  loading?: boolean;
  error?: string | null;
}

/**
 * Componente de listagem de pagamentos do usuário.
 * Layout aprimorado, responsividade, alinhamento e feedback amigável.
 */
const UserProfilePayments: React.FC<UserProfilePaymentsProps> = ({
  payments,
  loading = false,
  error = null
}) => {
  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500">Carregando pagamentos...</div>
    );
  }
  if (error) {
    return (
      <div className="py-12 text-center text-red-500">{error}</div>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Meus Pagamentos</h2>
      {/* O card externo agora tem padding igual aos outros cards */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* overflow-x-auto apenas na tabela */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase">Clínica/Serviço</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase">Data</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase">Valor</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase">Método</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500 bg-white">
                    Nenhum pagamento encontrado.
                  </td>
                </tr>
              )}
              {payments.map((payment) => (
                <tr key={payment.id} className="transition hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{payment.clinicName}</div>
                    <div className="text-gray-500">{payment.service}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(payment.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">
                    {payment.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{payment.method}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                      payment.status === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status === 'paid' ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default UserProfilePayments;