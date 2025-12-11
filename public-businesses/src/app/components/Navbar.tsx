"use client"
import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BsChatDots, BsPerson, BsBriefcase } from 'react-icons/bs';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { useParams } from 'next/navigation';


interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('Home');
  const { businessId } = useParams();

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };
  
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
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
                <Link href={`/stores/${businessId}`} onClick={() => handleTabClick('Home')} className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                  <BsChatDots className="mr-2" /> Home
                </Link>
                <Link href={`/stores/${businessId}/about`} onClick={() => handleTabClick('About')} className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                  <BsPerson className="mr-2" /> About Us
                </Link>
                <Link href={`/stores/${businessId}/contact`} onClick={() => handleTabClick('Contact')} className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                  <BsBriefcase className="mr-2" /> Contact
                </Link>
              </div>
            </div>
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
            <Link href={`/stores/${businessId}`} onClick={() => handleTabClick('Home')} className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                  <BsChatDots className="mr-2" /> Home
            </Link>
            <Link href={`/stores/${businessId}/about`} onClick={() => handleTabClick('About')} className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
              <BsPerson className="mr-2" /> About Us
            </Link>
            <Link href={`/stores/${businessId}/contact`} onClick={() => handleTabClick('Contact')} className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
              <BsBriefcase className="mr-2" /> Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
