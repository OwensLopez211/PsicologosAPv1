import { Outlet } from 'react-router-dom';
import Navbar from './public-components/Navbar';
import Footer from './public-components/Footer';
import ScrollToTop from './public-components/ScrollToTop';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow pt-[60px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;