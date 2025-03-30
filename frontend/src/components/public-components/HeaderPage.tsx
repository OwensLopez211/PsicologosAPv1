interface HeaderPageProps {
  title: string;
  description: string;
}

const HeaderPage = ({ title, description }: HeaderPageProps) => {
  return (
    <div className="w-full bg-[#B4E4D3] py-16 mt-[20px]"> {/* Added mt-[92px] for navbar + announcement */}
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-3xl font-serif text-gray-800 mb-4">
          {title}
        </h1>
        <p className="max-w-2xl mx-auto text-gray-700">
          {description}
        </p>
      </div>
    </div>
  );
};

export default HeaderPage;