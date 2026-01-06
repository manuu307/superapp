"use client";
import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BsPerson, BsBriefcase, BsStars, BsBatteryCharging, BsMoon, BsSun } from 'react-icons/bs';
import { AiOutlineMenu, AiOutlineClose, AiOutlinePoweroff } from 'react-icons/ai';
import { BiMap } from 'react-icons/bi';
import { Circle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

interface User {
  username: string;
  email?: string; // Assuming email might be part of the user object
}

interface AuthContextType {
  user: User | null;
  logout: () => void;
}

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { user, logout } = useContext(AuthContext) as AuthContextType;
  const { theme, toggleTheme } = useContext(ThemeContext) as ThemeContextType;
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 text-white font-bold text-xl">
              SuperApp
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/universe" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                  <BsStars className="mr-2" /> Universe
                </Link>
                <Link href="/social" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                  <Circle className="mr-2 w-4 h-4" /> Circles
                </Link>
                <Link href="/nearby" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                  <BiMap className="mr-2" /> Nearby
                </Link>
                <Link href="/business" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                  <BsBriefcase className="mr-2" /> Business
                </Link>
                <Link href="/battery" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                  <BsBatteryCharging className="mr-2" /> Battery
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center">
            <Link href="/profile">
              <BsPerson className="w-6 h-6 mr-4" />
            </Link>
            <button onClick={toggleTheme} className="mr-4">
              {theme === 'light' ? <BsMoon className="w-6 h-6" /> : <BsSun className="w-6 h-6" />}
            </button>
            <button onClick={handleLogout}>
              <AiOutlinePoweroff className="w-6 h-6" />
            </button>
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
            <Link href="/universe" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
              <BsStars className="mr-2" /> Universe
            </Link>
            <Link href="/social" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
              <Circle className="mr-2 w-4 h-4" /> Circles
            </Link>
            <Link href="/nearby" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
              <BiMap className="mr-2" /> Nearby
            </Link>
            <Link href="/business" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
              <BsBriefcase className="mr-2" /> Business
            </Link>
            <Link href="/battery" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
              <BsBatteryCharging className="mr-2" /> Battery
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
              <Link href="/profile" className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">
                Profile
              </Link>
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