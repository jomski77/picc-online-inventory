import { Button } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState, useRef } from 'react';
import { FaBoxOpen, FaExclamationTriangle, FaHistory, FaHospital } from 'react-icons/fa';

// NHS Logo Component
const NHSLogo = () => (
  <div className="flex items-center">
    <div className="bg-blue-600 text-white px-2 py-1 rounded-l-lg font-bold">
      NHS
    </div>
    <div className="border-t border-r border-b border-blue-600 text-blue-600 px-2 py-1 rounded-r-lg font-semibold dark:text-blue-400 dark:border-blue-400">
      PICC Inventory
    </div>
  </div>
);

// Wave Divider Component
const WaveDivider = ({ className = '', flip = false }) => (
  <div className={`w-full overflow-hidden ${className}`}>
    <svg 
      viewBox="0 0 1200 120" 
      preserveAspectRatio="none" 
      className={`w-full h-16 ${flip ? 'transform rotate-180' : ''}`}
    >
      <path 
        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
        className="fill-gray-100 dark:fill-gray-800"
      ></path>
    </svg>
  </div>
);

export default function Home() {
  const { currentUser } = useSelector((state) => state.user);
  const [isVisible, setIsVisible] = useState({
    hero: false,
    features: false
  });
  const [scrollY, setScrollY] = useState(0);
  const featuresRef = useRef(null);

  useEffect(() => {
    // Animation for elements when they come into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          
          // Set section visibility state for additional animations
          if (entry.target.id) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        }
      });
    }, { threshold: 0.1 });

    // Observe all animated elements
    document.querySelectorAll('.animate-on-scroll, section[id]').forEach(el => {
      observer.observe(el);
    });

    // Parallax effect on scroll
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.querySelectorAll('.animate-on-scroll, section[id]').forEach(el => {
        observer.unobserve(el);
      });
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className='min-h-screen flex flex-col justify-center items-center max-w-6xl mx-auto overflow-hidden'>
      {/* Hero Section */}
      <section id="hero" className='w-full py-12 px-3'>
        <div className='flex flex-col md:flex-row items-center gap-6 animate-on-scroll opacity-0 transition-all duration-700 ease-in-out'>
          <div className='flex-1 flex flex-col gap-6'>
            <div className="mb-4 transform scale-150 origin-left animate-on-scroll opacity-0 transition-all duration-700 delay-100">
              <NHSLogo />
            </div>
            <h1 className='text-4xl font-bold dark:text-white animate-on-scroll opacity-0 transition-all duration-700 delay-200'>
              PICC Insertion Team Inventory Management System
            </h1>
            
            {/* Enhanced Judy Beard Day Unit section */}
            <div 
              className="relative mt-2 mb-4 animate-on-scroll opacity-0 transition-all duration-700 delay-300"
              style={{
                transform: `translateY(${scrollY * 0.05}px)`
              }}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-lg opacity-75 animate-pulse"></div>
              <div className="relative px-4 py-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-500 dark:border-blue-400">
                <div className="flex items-center">
                  <FaHospital className="text-blue-600 dark:text-blue-400 text-2xl mr-2" />
                  <h2 className='text-2xl text-blue-600 dark:text-blue-400 font-bold tracking-wider'>
                    Judy Beard Day Unit
                  </h2>
                </div>
              </div>
            </div>
            
            <h3 className='text-xl text-gray-700 dark:text-gray-300 animate-on-scroll opacity-0 transition-all duration-700 delay-400'>
              Conquest Hospital, East Sussex Healthcare NHS Trust
            </h3>
            <p className='text-gray-500 dark:text-gray-400 animate-on-scroll opacity-0 transition-all duration-700 delay-500'>
              Efficiently manage your inventory records with our easy-to-use system.
              Track stock levels, monitor usage, and stay on top of reordering.
            </p>
            {currentUser ? (
              <Button
                gradientDuoTone='purpleToPink'
                size='lg'
                className='w-full md:w-fit hover:scale-105 transition-transform duration-300 animate-on-scroll opacity-0 transition-opacity duration-700 delay-600'
              >
                <Link to='/dashboard'>Go to Dashboard</Link>
              </Button>
            ) : (
              <Button
                gradientDuoTone='purpleToPink'
                size='lg'
                className='w-full md:w-fit hover:scale-105 transition-transform duration-300 animate-on-scroll opacity-0 transition-opacity duration-700 delay-600'
              >
                <Link to='/sign-in'>Get Started</Link>
              </Button>
            )}
          </div>
          <div 
            className='flex-1 p-4 flex items-center justify-center animate-on-scroll opacity-0 transition-all duration-700 delay-300'
            style={{
              transform: `translateY(${-scrollY * 0.03}px)`
            }}
          >
            <div className="relative w-full max-w-md">
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-blue-600 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-600 rounded-full opacity-20 animate-pulse"></div>
              <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex items-center justify-center mb-6 h-28 overflow-visible relative group">
                  {/* Trailing circles for the bouncing NHS logo */}
                  <div className="absolute w-14 h-14 bg-blue-500 rounded-full opacity-10 animate-bounce-around group-hover:opacity-20" style={{ animationDelay: '-1s' }}></div>
                  <div className="absolute w-16 h-16 bg-blue-500 rounded-full opacity-15 animate-bounce-around group-hover:opacity-25" style={{ animationDelay: '-2s' }}></div>
                  <div className="absolute w-18 h-18 bg-blue-500 rounded-full opacity-20 animate-bounce-around group-hover:opacity-30" style={{ animationDelay: '-3s' }}></div>
                  
                  {/* Main NHS Logo */}
                  <div 
                    className="w-20 h-20 bg-blue-600 text-white flex items-center justify-center rounded-full text-2xl font-bold animate-bounce-around shadow-lg relative z-10 transition-transform duration-300 group-hover:scale-110"
                    style={{ animationPlayState: 'running' }}
                    onMouseEnter={(e) => {
                      // Pause the animation when hovering
                      e.currentTarget.style.animationPlayState = 'paused';
                      // Add a temporary bright glow
                      e.currentTarget.classList.add('ring-4', 'ring-blue-300');
                    }}
                    onMouseLeave={(e) => {
                      // Resume the animation
                      e.currentTarget.style.animationPlayState = 'running';
                      // Remove the glow
                      e.currentTarget.classList.remove('ring-4', 'ring-blue-300');
                    }}
                  >
                    NHS
                    <div className="absolute -inset-1 bg-blue-400 rounded-full opacity-30 blur-sm animate-pulse"></div>
                  </div>
                  <div className="absolute inset-0 bg-transparent pointer-events-none group-hover:bg-blue-50 dark:group-hover:bg-blue-900 opacity-0 group-hover:opacity-10 rounded-full transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold text-center dark:text-white mb-4">Inventory Management</h3>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-600 dark:text-gray-300 transform hover:translate-x-2 hover:scale-110 transition-all duration-300 hover:font-semibold hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer group">
                    <span className="mr-2 text-green-500 transition-transform duration-300 group-hover:scale-125">✓</span> 
                    <span className="relative overflow-hidden">
                      Track PICC supplies
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                    </span>
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300 transform hover:translate-x-2 hover:scale-110 transition-all duration-300 hover:font-semibold hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer group">
                    <span className="mr-2 text-green-500 transition-transform duration-300 group-hover:scale-125">✓</span> 
                    <span className="relative overflow-hidden">
                      Monitor usage patterns
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                    </span>
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300 transform hover:translate-x-2 hover:scale-110 transition-all duration-300 hover:font-semibold hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer group">
                    <span className="mr-2 text-green-500 transition-transform duration-300 group-hover:scale-125">✓</span> 
                    <span className="relative overflow-hidden">
                      Reduce wastage
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                    </span>
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300 transform hover:translate-x-2 hover:scale-110 transition-all duration-300 hover:font-semibold hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer group">
                    <span className="mr-2 text-green-500 transition-transform duration-300 group-hover:scale-125">✓</span> 
                    <span className="relative overflow-hidden">
                      Improve patient care
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <WaveDivider className="animate-on-scroll opacity-0 transition-all duration-700" />
      
      {/* Features Section */}
      <section 
        id="features" 
        className='w-full py-16 px-3 bg-gray-100 dark:bg-gray-800'
        ref={featuresRef}
      >
        <div className='flex flex-col gap-8 w-full'>
          <h2 className='text-3xl font-bold text-center dark:text-white animate-on-scroll opacity-0 transition-all duration-700 ease-in-out'>
            Features
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
            <div 
              className='bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 border-t-4 border-blue-500 hover:transform hover:-translate-y-2 transition-all duration-300 ease-in-out animate-on-scroll opacity-0 transition-all duration-700 ease-in-out delay-100'
              style={{ 
                transform: isVisible.features ? 'translateY(0)' : 'translateY(30px)', 
                opacity: isVisible.features ? 1 : 0,
                transition: 'transform 0.6s ease, opacity 0.6s ease',
                boxShadow: isVisible.features ? '0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.2)' : ''
              }}
            >
              <div className='flex items-center justify-center mb-4 bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-16 h-16 mx-auto'>
                <FaBoxOpen className='text-3xl text-blue-600 dark:text-blue-300' />
              </div>
              <h3 className='text-xl font-bold mb-3 dark:text-white text-center'>
                Stock Management
              </h3>
              <p className='text-gray-600 dark:text-gray-300 text-center'>
                Easily add or use stock with a simple interface.
                Keep track of all inventory movements.
              </p>
            </div>
            <div 
              className='bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 border-t-4 border-red-500 hover:transform hover:-translate-y-2 transition-all duration-300 ease-in-out animate-on-scroll opacity-0 transition-all duration-700 ease-in-out delay-200'
              style={{ 
                transform: isVisible.features ? 'translateY(0)' : 'translateY(30px)', 
                opacity: isVisible.features ? 1 : 0,
                transition: 'transform 0.6s ease 0.2s, opacity 0.6s ease 0.2s',
                boxShadow: isVisible.features ? '0 10px 15px -3px rgba(239, 68, 68, 0.3), 0 4px 6px -2px rgba(239, 68, 68, 0.2)' : ''
              }}
            >
              <div className='flex items-center justify-center mb-4 bg-red-100 dark:bg-red-900 p-3 rounded-full w-16 h-16 mx-auto'>
                <FaExclamationTriangle className='text-3xl text-red-600 dark:text-red-300' />
              </div>
              <h3 className='text-xl font-bold mb-3 dark:text-white text-center'>
                Low Stock Alerts
              </h3>
              <p className='text-gray-600 dark:text-gray-300 text-center'>
                Get alerted when items reach their reorder threshold.
                Never run out of critical supplies.
              </p>
            </div>
            <div 
              className='bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 border-t-4 border-green-500 hover:transform hover:-translate-y-2 transition-all duration-300 ease-in-out animate-on-scroll opacity-0 transition-all duration-700 ease-in-out delay-300'
              style={{ 
                transform: isVisible.features ? 'translateY(0)' : 'translateY(30px)', 
                opacity: isVisible.features ? 1 : 0,
                transition: 'transform 0.6s ease 0.4s, opacity 0.6s ease 0.4s',
                boxShadow: isVisible.features ? '0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(16, 185, 129, 0.2)' : ''
              }}
            >
              <div className='flex items-center justify-center mb-4 bg-green-100 dark:bg-green-900 p-3 rounded-full w-16 h-16 mx-auto'>
                <FaHistory className='text-3xl text-green-600 dark:text-green-300' />
              </div>
              <h3 className='text-xl font-bold mb-3 dark:text-white text-center'>
                Usage History
              </h3>
              <p className='text-gray-600 dark:text-gray-300 text-center'>
                Track who used what and when.
                Maintain complete audit trails of inventory movement.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className='mt-16 mb-8 text-center w-full animate-on-scroll opacity-0 transition-all duration-700 ease-in-out'>
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          © {new Date().getFullYear()} East Sussex Healthcare NHS Trust. All rights reserved.
        </p>
      </div>
    </div>
  );
} 