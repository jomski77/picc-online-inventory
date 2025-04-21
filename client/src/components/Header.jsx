import { Button, Dropdown, Avatar } from 'flowbite-react';
import { Link, useLocation } from 'react-router-dom';
import { FaMoon, FaSun, FaTachometerAlt, FaBoxes, FaPlus, FaMinus, FaUserCog, FaClipboardList, FaChartLine } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import { signoutSuccess } from '../redux/user/userSlice';
import { useEffect, useState } from 'react';
import { apiPost } from '../utils/apiConfig';

export default function Header() {
  const path = useLocation().pathname;
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Track scroll position to add shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignout = async () => {
    try {
      const res = await apiPost('auth/signout');
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Style classes
  const navLinkClass = "px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400";
  const navLinkActiveClass = "px-3 py-2 rounded-md text-sm font-medium text-blue-700 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-500 transition-colors duration-200";
  const mobileNavLinkClass = "flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800 dark:hover:text-blue-400";
  const mobileNavLinkActiveClass = "flex items-center px-3 py-2 rounded-md text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 transition-colors duration-200";

  return (
    <header className="fixed top-0 left-0 w-full h-16 md:h-20 z-50">
      <div 
        className={`h-full w-full transition-all duration-300 
          ${scrolled ? 'shadow-lg bg-white dark:bg-gray-900 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90' : 'bg-white dark:bg-gray-900'} 
          border-b-2 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}
      >
        <div className="container mx-auto h-full px-4 flex items-center justify-between">
          <Link
            to='/'
            className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white hover:scale-105 transition-transform duration-300'
          >
            <div className="inline-flex items-center border-2 border-blue-600 dark:border-blue-500 rounded-lg p-1 shadow-md">
              <span className='px-2 py-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white shadow-md'>
                <span className="text-blue-200 font-bold">NHS</span> PICC
              </span>
              <span className='mx-2 text-blue-800 dark:text-blue-300'>Inventory</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className={path === '/' ? navLinkActiveClass : navLinkClass}>
              Home
            </Link>
            
            {currentUser && (
              <>
                <Link to="/dashboard" className={path === '/dashboard' ? navLinkActiveClass : navLinkClass}>
                  Dashboard
                </Link>
                <Link to="/activity-chart" className={path === '/activity-chart' ? navLinkActiveClass : navLinkClass}>
                  Activity Chart
                </Link>
                <Link to="/items" className={path === '/items' ? navLinkActiveClass : navLinkClass}>
                  Supplies
                </Link>
                <Link to="/add-stock" className={path === '/add-stock' ? navLinkActiveClass : navLinkClass}>
                  Add Supply
                </Link>
                <Link to="/use-stock" className={path === '/use-stock' ? navLinkActiveClass : navLinkClass}>
                  Use Supply
                </Link>
                
                {currentUser.isAdmin && (
                  <>
                    <Link to="/create-item" className={path === '/create-item' ? navLinkActiveClass : navLinkClass}>
                      Create Item
                    </Link>
                    <Link to="/manage-users" className={path === '/manage-users' ? navLinkActiveClass : navLinkClass}>
                      Manage Users
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
          
          <div className='flex items-center gap-2'>
            <Button
              className='w-10 h-10 hidden sm:inline hover:rotate-12 transition-transform duration-300'
              color={theme === 'light' ? 'light' : 'dark'}
              pill
              onClick={() => dispatch(toggleTheme())}
            >
              {theme === 'light' ? <FaMoon /> : <FaSun className="text-yellow-300" />}
            </Button>
            
            {currentUser ? (
              <Dropdown
                arrowIcon={false}
                inline
                label={
                  <Avatar
                    alt='user'
                    img={currentUser.profilePicture}
                    rounded
                    className="hover:scale-110 transition-all duration-300"
                  />
                }
              >
                <Dropdown.Header>
                  <span className="block text-sm">@{currentUser.username}</span>
                  <span className="block text-sm font-medium truncate">
                    {currentUser.email}
                  </span>
                  {currentUser.isAdmin && (
                    <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Admin
                    </span>
                  )}
                </Dropdown.Header>
                <Link to={'/dashboard'}>
                  <Dropdown.Item icon={FaTachometerAlt}>Dashboard</Dropdown.Item>
                </Link>
                <Link to={'/profile'}>
                  <Dropdown.Item icon={FaUserCog}>Profile</Dropdown.Item>
                </Link>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleSignout} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                  Sign out
                </Dropdown.Item>
              </Dropdown>
            ) : (
              path === '/sign-in' ? (
                <Link to='/sign-up'>
                  <Button gradientDuoTone='purpleToBlue' pill className="px-4 py-2 font-medium hover:scale-105 transition-transform">
                    Sign Up
                  </Button>
                </Link>
              ) : path === '/sign-up' ? (
                <Link to='/sign-in'>
                  <Button gradientDuoTone='purpleToBlue' pill className="px-4 py-2 font-medium hover:scale-105 transition-transform">
                    Sign In
                  </Button>
                </Link>
              ) : (
                <Link to='/sign-in'>
                  <Button gradientDuoTone='purpleToBlue' pill className="px-4 py-2 font-medium hover:scale-105 transition-transform">
                    Sign In
                  </Button>
                </Link>
              )
            )}
            
            <Button
              onClick={toggleMenu}
              className="md:hidden inline-flex items-center p-2 ml-1 text-sm rounded-lg focus:outline-none focus:ring-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-200 dark:focus:ring-gray-600"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
              </svg>
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`md:hidden ${menuOpen ? 'block' : 'hidden'} bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700`}>
          <div className="px-4 py-3 space-y-1">
            <Link to="/" className={path === '/' ? mobileNavLinkActiveClass : mobileNavLinkClass}>
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Home
            </Link>
            
            {currentUser && (
              <>
                <Link to="/dashboard" className={path === '/dashboard' ? mobileNavLinkActiveClass : mobileNavLinkClass}>
                  <FaTachometerAlt className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <Link to="/activity-chart" className={path === '/activity-chart' ? mobileNavLinkActiveClass : mobileNavLinkClass}>
                  <FaChartLine className="w-4 h-4 mr-2" />
                  Activity Chart
                </Link>
                <Link to="/items" className={path === '/items' ? mobileNavLinkActiveClass : mobileNavLinkClass}>
                  <FaBoxes className="w-4 h-4 mr-2" />
                  Supplies
                </Link>
                
                <Link to="/add-stock" className={path === '/add-stock' ? mobileNavLinkActiveClass : mobileNavLinkClass}>
                  <FaPlus className="w-4 h-4 mr-2" />
                  Add Supply
                </Link>
                
                <Link to="/use-stock" className={path === '/use-stock' ? mobileNavLinkActiveClass : mobileNavLinkClass}>
                  <FaMinus className="w-4 h-4 mr-2" />
                  Use Supply
                </Link>
                
                {currentUser.isAdmin && (
                  <>
                    <Link to="/create-item" className={path === '/create-item' ? mobileNavLinkActiveClass : mobileNavLinkClass}>
                      <FaClipboardList className="w-4 h-4 mr-2" />
                      Create Supply Item
                    </Link>
                    
                    <Link to="/manage-users" className={path === '/manage-users' ? mobileNavLinkActiveClass : mobileNavLinkClass}>
                      <FaUserCog className="w-4 h-4 mr-2" />
                      Manage Users
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 