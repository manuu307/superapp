import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsChatDots, BsPerson, BsBriefcase } from 'react-icons/bs';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 text-white font-bold text-xl">
              SuperApp
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                  <BsChatDots className="mr-2" /> Social
                </Link>
                <Link to="/profile" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                  <BsPerson className="mr-2" /> Profile
                </Link>
                <Link to="/business" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                  <BsBriefcase className="mr-2" /> Business
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center">
            <button onClick={toggleTheme} className="px-4 py-2 mr-4 font-bold text-white bg-gray-500 rounded-md hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-900">
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
            </button>
            <span className="mr-4">Welcome, {user?.username}</span>
            <button onClick={handleLogout} className="px-4 py-2 font-bold text-white bg-red-500 rounded-md hover:bg-red-700">Logout</button>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button onClick={toggleMenu} className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
              <span className="sr-only">Open main menu</span>
              {isOpen ? <AiOutlineClose className="block h-6 w-6" /> : <AiOutlineMenu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
              <BsChatDots className="mr-2" /> Social
            </Link>
            <Link to="/profile" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
              <BsPerson className="mr-2" /> Profile
            </Link>
            <Link to="/business" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
              <BsBriefcase className="mr-2" /> Business
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-5">
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-white">{user?.username}</div>
                <div className="text-sm font-medium leading-none text-gray-400">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <button onClick={toggleTheme} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">
                Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
              </button>
              <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
