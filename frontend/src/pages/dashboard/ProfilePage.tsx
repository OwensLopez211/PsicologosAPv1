import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPsychologistProfile, updatePsychologistProfile } from '../../services/profileService';
import BasicInfo from '../../components/profile/BasicInfo';
import ProfessionalInfo from '../../components/profile/ProfessionalInfo';
import PageTransition from '../../components/public-components/PageTransition';
import ScheduleAndFees from '../../components/profile/ScheduleAndFees';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { id: 'basic', label: 'Datos Básicos' },
    { id: 'professional', label: 'Información Profesional' },
    { id: 'schedule', label: 'Horarios y Tarifas' },
    { id: 'documents', label: 'Documentos' },
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getPsychologistProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBasicInfo = async (data) => {
    setIsLoading(true);
    try {
      const updatedProfile = await updatePsychologistProfile(data);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfessionalInfo = async (data) => {
    setIsLoading(true);
    try {
      const updatedProfile = await updatePsychologistProfile(data);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating professional info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSchedule = async (data) => {
    setIsLoading(true);
    try {
      const updatedProfile = await updatePsychologistProfile(data);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 ">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2A6877] mb-6">
          Mi Perfil Profesional
        </h1>

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
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
          {activeTab === 'basic' && (
            <BasicInfo
              profile={profile}
              onSave={handleSaveBasicInfo}
              isLoading={isLoading}
            />
          )}
          
          {activeTab === 'professional' && (
            <ProfessionalInfo
              profile={profile}
              onSave={handleSaveProfessionalInfo}
              isLoading={isLoading}
            />
          )}
          
          {activeTab === 'schedule' && (
            <ScheduleAndFees
              profile={profile}
              onSave={handleSaveSchedule}
              isLoading={isLoading}
            />
          )}
          
          {activeTab === 'documents' && (
            <div>
              {/* Documents Upload Section will go here */}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ProfilePage;