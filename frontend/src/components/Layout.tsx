import { Outlet } from 'react-router-dom';
import Navbar from './public-components/Navbar';
import Footer from './public-components/Footer';
import ScrollToTop from './public-components/ScrollToTop';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow mt-16 lg:mt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;