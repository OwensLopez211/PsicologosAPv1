import { FC } from 'react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  disabled?: boolean;
  disabledMessage?: string;
}

interface PaymentSelectorProps {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (methodId: string) => void;
  selectedSlot: {date: string, startTime: string, endTime: string} | null;
  psychologistName: string;
  formatDate: (dateStr: string) => string;
  formatTime: (time: string) => string;
}

const PaymentSelector: FC<PaymentSelectorProps> = ({
  paymentMethods,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  selectedSlot,
  psychologistName,
  formatDate,
  formatTime
}) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Seleccione un método de pago</h3>
      
      <div className="space-y-3">
        {paymentMethods.map(method => (
          <div 
            key={method.id}
            className={`border rounded-lg p-4 ${
              method.disabled 
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-70' 
                : selectedPaymentMethod === method.id 
                  ? 'border-blue-500 bg-blue-50 cursor-pointer' 
                  : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
            } transition-colors`}
            onClick={() => !method.disabled && onPaymentMethodSelect(method.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  {method.icon === 'credit-card' && (
                    <svg className={`w-6 h-6 ${method.disabled ? 'text-gray-400' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  )}
                  {method.icon === 'bank' && (
                    <svg className={`w-6 h-6 ${method.disabled ? 'text-gray-400' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                  )}
                  {method.icon === 'paypal' && (
                    <svg className={`w-6 h-6 ${method.disabled ? 'text-gray-400' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h4 className={`font-medium ${method.disabled ? 'text-gray-500' : 'text-gray-900'}`}>{method.name}</h4>
                  <p className={`text-sm ${method.disabled ? 'text-gray-400' : 'text-gray-600'}`}>{method.description}</p>
                </div>
              </div>
              {method.disabled && method.disabledMessage && (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  {method.disabledMessage}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {selectedSlot && (
        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Resumen de la cita</h4>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Fecha:</span> {formatDate(selectedSlot.date)}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Hora:</span> {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Especialista:</span> {psychologistName}
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentSelector;