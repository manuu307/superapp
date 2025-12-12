"use client"
import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { BsChatDots, BsPerson, BsBriefcase } from 'react-icons/bs';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { useBusiness } from '@/context/BusinessContext';

interface User {
  username: string;
  email?: string; // Assuming email might be part of the user object
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { businessData } = useBusiness();


  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 text-white font-bold text-xl">
              {businessData?.name}
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                  <BsChatDots className="mr-2" /> Store
                </Link>
                <Link href="/about" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                  <BsPerson className="mr-2" /> About Us
                </Link>
                <Link href="/contact" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
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
            <Link href="/" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
              <BsChatDots className="mr-2" /> Store
            </Link>
            <Link href="/about" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
              <BsPerson className="mr-2" /> Profile
            </Link>
            <Link href="/contact" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
              <BsBriefcase className="mr-2" /> Business
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
