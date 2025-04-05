import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile } from '../../services/profileService';
import BasicInfo from '../../components/profile/BasicInfo';
import ProfessionalInfo from '../../components/profile/ProfessionalInfo';
import PageTransition from '../../components/animations/PageTransition';
import ScheduleAndFees from '../../components/profile/ScheduleAndFees';
import DocumentsUpload from '../../components/profile/DocumentsUpload';
import BankInfo from '../../components/profile/BankInfo';
// import Loader from '../../components/ui/Loader'; // Make sure you have this component

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Define tabs based on user type
  const getTabs = () => {
    const baseTabs = [
      { id: 'basic', label: 'Datos Básicos' },
    ];
    
    // Add professional info tab only for psychologists
    if (user?.user_type === 'psychologist') {
      baseTabs.push(
        { id: 'professional', label: 'Información Profesional' },
        { id: 'schedule', label: 'Horarios y Tarifas' },
        { id: 'documents', label: 'Documentos' },
        { id: 'bankinfo', label: 'Datos Bancarios' }
      );
    }

    // Add bank info tab for clients
    if (user?.user_type === 'client') {
      baseTabs.push(
        { id: 'bankinfo', label: 'Datos Bancarios' },
      );
    }
    
    // Add bank info tab for admins
    if (user?.user_type === 'admin') {
      baseTabs.push(
        { id: 'bankinfo', label: 'Datos Bancarios' },
      );
    }
    
    return baseTabs;
  };

  const tabs = getTabs();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile(user?.user_type || '');
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBasicInfo = async (data: any) => {
    setIsLoading(true);
    try {
      const updatedProfile = await updateProfile(user?.user_type || '', data);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this new function to handle bank info updates
  const handleProfileUpdate = (updatedProfile: any) => {
    // Update the profile state with the new data
    setProfile(updatedProfile);
  };

  // If the active tab is not available for the current user type, reset to basic
  useEffect(() => {
    const availableTabs = tabs.map(tab => tab.id);
    if (!availableTabs.includes(activeTab)) {
      setActiveTab('basic');
    }
  }, [user?.user_type]);

  return (
    <PageTransition>
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2A6877] mb-6">
          Mi Perfil
        </h1>
        
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#2A6877]"></div>
            <p className="mt-4 text-gray-600">Cargando tu perfil...</p>
          </div>
        ) : (
          <>
            {/* Only show tabs if there's more than one */}
            {tabs.length > 1 && (
              <>
                {/* Mobile Dropdown */}
                <div className="md:hidden mb-4">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-full flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow"
                  >
                    <span>{tabs.find(tab => tab.id === activeTab)?.label}</span>
                    <svg
                      className={`w-5 h-5 transition-transform ${isMenuOpen ? 'transform rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isMenuOpen && (
                    <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg">
                      {tabs.map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                            activeTab === tab.id ? 'text-[#2A6877] bg-gray-50' : 'text-gray-700'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop Navigation Tabs */}
                <div className="hidden md:block border-b border-gray-200 mb-8">
                  <nav className="-mb-px flex flex-wrap space-x-8">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${
                          activeTab === tab.id
                            ? 'border-[#2A6877] text-[#2A6877]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </>
            )}

            {/* Content Sections */}
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
              {activeTab === 'basic' && (
                <BasicInfo
                  profile={profile}
                  onSave={handleSaveBasicInfo}
                  isLoading={isLoading}
                />
              )}
              
              {activeTab === 'professional' && user?.user_type === 'psychologist' && (
                <ProfessionalInfo
                  profile={profile}
                  onSave={handleSaveBasicInfo}
                  isLoading={isLoading}
                />
              )}
              
              {activeTab === 'schedule' && user?.user_type === 'psychologist' && (
                <ScheduleAndFees
                  profile={profile}
                  isLoading={isLoading}
                />
              )}
              
              {activeTab === 'documents' && user?.user_type === 'psychologist' && (
                <DocumentsUpload
                  profile={profile}
                  isLoading={isLoading}
                />
              )}
              
              {activeTab === 'bankinfo' && (
                <BankInfo
                  profile={profile}
                  isLoading={isLoading}
                  onProfileUpdate={handleProfileUpdate}
                />
              )}
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default ProfilePage;