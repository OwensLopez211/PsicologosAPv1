// src/pages/public-pages/RegisterPage.tsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageTransition from '../../components/public-components/PageTransition';
import UserTypeSelection from '../../components/auth/UserTypeSelection';
import RegistrationForm from '../../components/auth/RegistrationForm';
import { register } from '../../services/authService';
import toast from 'react-hot-toast';

type UserType = 'patient' | 'psychologist' | null;

const RegisterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [userType, setUserType] = useState<UserType>(location.state?.userType || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
  };

  const handleFormSubmit = async (formData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    terms: boolean;
  }) => {
    setIsLoading(true);
    
    try {
      if (!formData.terms) {
        toast.error('Debe aceptar los términos y condiciones');
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Las contraseñas no coinciden');
        setIsLoading(false);
        return;
      }
      
      // Mapear el tipo de usuario UI a los valores del backend
      const backendUserType = userType === 'patient' ? 'client' : 'psychologist';

      // Crear objeto de datos incluyendo datos para el perfil
      const registerData = {
        email: formData.email.trim(),
        username: formData.email.trim(),
        password: formData.password,
        password2: formData.confirmPassword,
        user_type: backendUserType,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim() || ' ',
        phone_number: formData.phoneNumber || '',
        ...(userType === 'psychologist' ? {
          professional_title: 'Psicólogo',
        } : {})
      };

      const response = await register(registerData);
      
      // Normalizar el tipo de usuario para la consistencia en la aplicación
      const normalizedUserType = response.user.user_type.toLowerCase() as 'client' | 'psychologist' | 'admin';
      
      setUser({
        ...response.user,
        user_type: normalizedUserType
      });
      
      toast.success('Registro exitoso');
      
      // Redireccionar según el tipo de usuario
      navigate(userType === 'patient' ? '/dashboard' : '/psicologo/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.message === 'EMAIL_EXISTS') {
        // El toast ya se mostró en el servicio de autenticación
      } else if (error.message === 'VALIDATION_ERROR') {
        // El toast ya se mostró en el servicio de autenticación
      } else if (!error.response) {
        toast.error('Error de conexión. Por favor, verifica tu conexión a internet.');
      } else {
        toast.error('Error en el registro. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      {!userType ? (
        <UserTypeSelection onSelectUserType={handleUserTypeSelect} />
      ) : (
        <RegistrationForm 
          userType={userType} 
          onSubmit={handleFormSubmit} 
          onChangeUserType={() => setUserType(null)}
          isLoading={isLoading}
        />
      )}
    </PageTransition>
  );
};

export default RegisterPage;