import { FC } from 'react';
import { motion } from 'framer-motion';

interface ProfileHeaderProps {
  name: string;
  title: string;
  registrationNumber: string;
  profileImage: string;
  onSchedule: () => void;
  verificationStatus?: string;
}

const ProfileHeader: FC<ProfileHeaderProps> = ({
  name,
  title,
  registrationNumber,
  profileImage,
  onSchedule,
  verificationStatus = 'VERIFIED'
}) => (
  <motion.div 
    className="bg-white shadow-sm"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="container mx-auto px-6 py-8">
      <div className="md:flex md:items-center md:gap-12">
        <div className="md:w-1/4 relative">
          <motion.img 
            src={profileImage}
            alt={name}
            className="w-48 h-48 rounded-full object-cover mx-auto shadow-lg border-4 border-white"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          {verificationStatus === 'VERIFIED' && (
            <motion.div 
              className="absolute bottom-2 right-1/2 transform translate-x-16 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Verificado
            </motion.div>
          )}
        </div>
        <div className="md:w-3/4 mt-6 md:mt-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <motion.h1 
                className="text-3xl font-semibold text-gray-900"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {name}
              </motion.h1>
              <motion.p 
                className="text-[#2A6877] font-medium mt-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {title}
              </motion.p>
              {registrationNumber && (
                <motion.p 
                  className="text-gray-600 text-sm mt-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Registro: {registrationNumber}
                </motion.p>
              )}
            </div>
            <motion.button 
              className="bg-[#2A6877] text-white px-6 py-3 rounded-md hover:bg-[#235A67] transition-colors mt-4 md:mt-0 shadow-md hover:shadow-lg"
              onClick={onSchedule}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Agendar Consulta
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export default ProfileHeader;