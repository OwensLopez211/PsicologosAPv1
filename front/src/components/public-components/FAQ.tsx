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
          "E-mind funciona en tres sencillos pasos: primero, completas un breve cuestionario sobre tus necesidades; segundo, nuestro sistema te recomienda los profesionales más adecuados para tu caso; y tercero, eliges al psicólogo que prefieras y programas tu primera sesión online a través de nuestra plataforma segura."
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
          "Las sesiones se realizan a través de videollamada en nuestra plataforma segura. Solo necesitas un dispositivo con conexión a internet, cámara y micrófono. Nuestra interfaz es intuitiva y garantiza la privacidad de tus sesiones en todo momento."
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
          "Nuestras tarifas varían según el tipo de terapia y la experiencia del profesional, con precios que comienzan desde 40€ por sesión. También ofrecemos paquetes de sesiones con descuentos y planes mensuales para quienes buscan un seguimiento continuo."
      },
      {
        question: "¿Existe algún cargo por cancelar una sesión?",
        answer:
          "Puedes cancelar o reprogramar tu sesión sin cargo hasta 24 horas antes de la hora programada. Las cancelaciones con menos de 24 horas de antelación pueden generar un cargo del 50% del valor de la sesión, dependiendo de la política del profesional."
      },
      {
        question: "¿Ofrecen algún tipo de descuento o plan especial?",
        answer:
          "Sí, contamos con varios planes especiales, como el paquete de 4 sesiones mensuales con un 15% de descuento, tarifas reducidas para estudiantes y planes familiares. También realizamos promociones especiales periódicamente para nuevos usuarios."
      }
    ],
    "Proceso": [
      {
        question: "¿Cómo me registro en e-mind?",
        answer:
          "Puedes registrarte fácilmente en nuestra web haciendo clic en el botón 'Comenzar ahora'. Solo necesitas proporcionar tu correo electrónico y crear una contraseña. Luego completarás un breve cuestionario para que podamos entender mejor tus necesidades y recomendarte los profesionales más adecuados."
      },
      {
        question: "¿Cuánto tiempo dura cada sesión de terapia?",
        answer:
          "Las sesiones estándar tienen una duración de 50-60 minutos, aunque algunos especialistas también ofrecen formatos de 30 minutos para seguimientos breves o de 90 minutos para terapias específicas que requieren más tiempo, como la terapia de pareja."
      },
      {
        question: "¿Con qué frecuencia debo tener sesiones?",
        answer:
          "La frecuencia recomendada suele ser de una sesión semanal al inicio de la terapia, aunque esto puede variar según tus necesidades específicas y las recomendaciones de tu psicólogo. Con el tiempo, muchos pacientes pasan a sesiones quincenales o mensuales a medida que avanzan en su proceso."
      }
    ],
    "Privacidad": [
      {
        question: "¿Cómo garantizan la confidencialidad de mis sesiones?",
        answer:
          "Utilizamos tecnología de encriptación de extremo a extremo para todas las videollamadas, asegurando que nadie pueda acceder al contenido de tus sesiones. Además, nuestros profesionales están obligados por el código deontológico a mantener la confidencialidad de todo lo tratado en terapia."
      },
      {
        question: "¿Qué datos personales necesito proporcionar?",
        answer:
          "Solicitamos los datos básicos necesarios para facilitar el servicio: nombre, correo electrónico y método de pago. La información adicional que compartas en el cuestionario inicial nos ayuda a encontrar el profesional más adecuado, pero siempre puedes elegir el nivel de detalle que deseas proporcionar."
      },
      {
        question: "¿Mis sesiones quedan grabadas?",
        answer:
          "No, en e-mind no grabamos ninguna sesión. Las videollamadas son en tiempo real y no se almacenan en nuestros servidores. Tu privacidad es nuestra prioridad absoluta y cumplimos con todas las normativas de protección de datos aplicables."
      }
    ],
    "Técnico": [
      {
        question: "¿Qué dispositivos puedo usar para conectarme a las sesiones?",
        answer:
          "Puedes acceder a las sesiones desde cualquier dispositivo con conexión a internet: ordenadores, tablets o smartphones. Nuestra plataforma es compatible con Windows, Mac, iOS y Android. Recomendamos utilizar Google Chrome o Safari para una mejor experiencia."
      },
      {
        question: "¿Qué hago si tengo problemas técnicos durante una sesión?",
        answer:
          "Si experimentas problemas técnicos, nuestra plataforma ofrece un chat de soporte técnico inmediato. También puedes intentar actualizar la página, verificar tu conexión a internet o cambiar a otro dispositivo. En caso de interrupción prolongada, podrás reprogramar el tiempo restante de tu sesión sin costo adicional."
      },
      {
        question: "¿Necesito descargar algún programa o aplicación?",
        answer:
          "No es necesario descargar ningún programa especial. Nuestra plataforma funciona directamente desde el navegador web. Sin embargo, también contamos con aplicaciones móviles para iOS y Android que ofrecen funcionalidades adicionales y mayor comodidad para gestionar tus citas."
      }
    ]
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
  );
};

export default FAQ;