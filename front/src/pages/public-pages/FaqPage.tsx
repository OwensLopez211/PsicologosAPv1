import HeaderPage from '../../components/public-components/HeaderPage';
import PageTransition from '../../components/animations/PageTransition';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Definición de tipos
interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  toggle: () => void;
}

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQData {
  [category: string]: FAQItem[];
}

// FAQ Item Component
const FAQItem = ({ question, answer, isOpen, toggle }: FAQItemProps) => {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        className="flex w-full items-center justify-between py-4 text-left focus:outline-none"
        onClick={toggle}
      >
        <h3 className="text-lg font-medium text-gray-900">{question}</h3>
        <ChevronDown
          className={`h-5 w-5 text-teal-600 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 pb-6' : 'max-h-0'
        }`}
      >
        <p className="text-gray-600">{answer}</p>
      </div>
    </div>
  );
};

// FAQ Categories tabs
const CategoryTabs = ({ categories, activeCategory, setActiveCategory }: CategoryTabsProps) => {
  return (
    <div className="mb-8 flex flex-wrap gap-2 sm:gap-4">
      {categories.map((category) => (
        <button
          key={category}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors sm:text-base ${
            activeCategory === category
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setActiveCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

// Search input component
const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => {
  return (
    <div className="mb-8 relative">
      <input
        type="text"
        placeholder="Buscar pregunta..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-4 text-gray-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
      />
      <svg
        className="absolute right-3 top-3.5 h-5 w-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
};

const FAQ = () => {
  // Sample FAQ data organized by categories
  const faqData: FAQData = {
    "Sobre e-mind": [
      {
        question: "¿Qué es e-mind?",
        answer:
          "E-mind es un servicio de psicoterapia online que te conecta con el profesional más adecuado a tus necesidades entre una amplia variedad de psicólogos y psicólogas certificados, permitiéndote recibir atención psicológica de calidad desde la comodidad de tu hogar."
      },
      {
        question: "¿Cómo funciona e-mind?",
        answer:
          "E-mind funciona en tres sencillos pasos: primero, te registras como paciente; segundo, buscar un psicológo que se adapte a tus necesidades y agendas la hora que te convenga; y tercero, te conectas el dia de la cita y comienza la terapia."
      },
      {
        question: "¿Quiénes son los profesionales de e-mind?",
        answer:
          "Todos nuestros psicólogos son profesionales certificados con título universitario, colegiados y con experiencia clínica probada. Pasan por un riguroso proceso de selección y verificación de credenciales antes de formar parte de nuestra red de especialistas."
      }
    ],
    "Servicios": [
      {
        question: "¿Qué tipos de terapia ofrecen en e-mind?",
        answer:
          "Ofrecemos diversos enfoques terapéuticos como terapia cognitivo-conductual, terapia humanista, terapia sistémica, mindfulness, entre otros. Contamos con especialistas en ansiedad, depresión, problemas de pareja, autoestima, estrés laboral, duelo y muchas otras áreas de la salud mental."
      },
      {
        question: "¿Cómo se realizan las sesiones de terapia?",
        answer:
          "Las sesiones se realizan a través de videollamada en una plataforma segura como Google Meet, Zoom o Microsoft Teams. Solo necesitas un dispositivo con conexión a internet, cámara y micrófono."
      },
      {
        question: "¿Puedo cambiar de psicólogo si no me siento cómodo?",
        answer:
          "Absolutamente. En e-mind entendemos que la conexión terapeuta-paciente es fundamental para el éxito de la terapia. Si no te sientes cómodo con tu psicólogo actual, puedes cambiar a otro profesional sin ningún problema y sin necesidad de explicaciones."
      }
    ],
    "Precios": [
      {
        question: "¿Cuánto cuesta una sesión de terapia en e-mind?",
        answer:
          "Nuestras tarifas varían según el tipo de terapia y la experiencia del profesional, dado que nuestro enfoque es ofrecer un servicio a bajo costo. las tarifas son entre los 2000"
      },
      {
        question: "¿Existe algún cargo por cancelar una sesión?",
        answer:
          ""
      },
      {
        question: "¿Ofrecen algún tipo de descuento o plan especial?",
        answer:
          "No, de momento no ofrecemos ningún tipo de descuento o plan especial. Planeamos ofrecer descuentos de distitnos tipos en el futuro."
      }
    ],
    "Proceso": [
      {
        question: "¿Cómo me registro en e-mind?",
        answer:
          "Puedes registrarte fácilmente en nuestra web haciendo clic en el botón 'Comenzar ahora'. Solo necesitas proporcionar tu nombre y apellido, correo electrónico y crear una contraseña."
      },
      {
        question: "¿Cuánto tiempo dura cada sesión de terapia?",
        answer:
          "Las sesiones tienen una duracion de 50 minutos, pero puede extenderse hasta 1 hora si el profesional lo considera necesario."
      },
      {
        question: "¿Con qué frecuencia debo tener sesiones?",
        answer:
          "La frecuencia recomendada suele ser de una sesión semanal al inicio de la terapia, aunque esto puede variar según tus necesidades específicas y las recomendaciones de tu psicólogo. Con el tiempo, muchos pacientes pasan a sesiones quincenales o mensuales a medida que avanzan en su proceso."
      }
    ],
  };

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Sobre e-mind");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = Object.keys(faqData);

  // Filter questions based on search query
  const filteredQuestions = searchQuery
    ? Object.entries(faqData).flatMap(([category, questions]) =>
        questions
          .filter(
            (item) =>
              item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.answer.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((item) => ({ ...item, category }))
      )
    : faqData[activeCategory as keyof typeof faqData];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <PageTransition>
      <HeaderPage
        title="Preguntas Frecuentes"
        description="Encuentra respuestas a las dudas más comunes sobre e-mind bienestar y cómo podemos ayudarte en tu camino hacia el equilibrio mental."
      />
      
      <section className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-4xl">
          

          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

          {!searchQuery && (
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          )}

          <div className="mt-8 rounded-xl bg-white p-6 shadow-lg">
            {searchQuery && filteredQuestions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-lg text-gray-600">
                  No se encontraron resultados para "{searchQuery}"
                </p>
                <button
                  className="mt-4 text-teal-600 hover:underline"
                  onClick={() => setSearchQuery("")}
                >
                  Limpiar búsqueda
                </button>
              </div>
            ) : searchQuery ? (
              // Search results
              filteredQuestions.map((item, index) => (
                <div key={index}>
                  {index > 0 && <hr className="my-2 border-gray-200" />}
                  <div className="mb-2 text-sm font-medium text-teal-600">
                    {item.category}
                  </div>
                  <FAQItem
                    question={item.question}
                    answer={item.answer}
                    isOpen={openIndex === index}
                    toggle={() => handleToggle(index)}
                  />
                </div>
              ))
            ) : (
              // Category view
              filteredQuestions.map((item, index) => (
                <FAQItem
                  key={index}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openIndex === index}
                  toggle={() => handleToggle(index)}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default FAQ;