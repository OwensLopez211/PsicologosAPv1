import { useAuth } from '../../context/AuthContext';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  specialistId: number;
  specialistName: string;
}

const ScheduleModal = ({ isOpen, onClose, specialistId, specialistName }: ScheduleModalProps) => {
  const { isAuthenticated } = useAuth();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {isAuthenticated ? (
                  <>
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Agendar consulta con {specialistName}
                    </Dialog.Title>
                    <div className="mt-4">
                      {/* Here goes the calendar component */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        Calendar component will be implemented here
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Iniciar sesión requerido
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Para agendar una consulta, necesitas iniciar sesión primero.
                      </p>
                    </div>
                    <div className="mt-4 space-y-3">
                      <Link
                        to="/login"
                        className="w-full inline-flex justify-center rounded-md border border-transparent bg-[#2A6877] px-4 py-2 text-sm font-medium text-white hover:bg-[#235A67] focus:outline-none"
                      >
                        Iniciar sesión
                      </Link>
                      <Link
                        to="/registro"
                        className="w-full inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                      >
                        Crear cuenta
                      </Link>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ScheduleModal;