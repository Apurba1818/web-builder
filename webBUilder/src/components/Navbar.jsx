import React from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { IoMdMoon, IoMdSunny } from "react-icons/io";

const Navbar = ({ isDarkMode, toggleTheme }) => {
  return (
    <div className="nav flex items-center justify-between px-6 md:px-16 lg:px-28 h-[70px]">
      
      <div className='logo'>
        <h3 className='text-[25px] font-bold bg-gradient-to-br from-violet-400 to-purple-600 bg-clip-text text-transparent'>
          WebBuilder
        </h3>
      </div>

      <div className='icons flex items-center gap-[15px]'>

        <i
          className='icon cursor-pointer text-xl hover:scale-110 transition'
          onClick={toggleTheme}
        >
          {isDarkMode ? <IoMdSunny /> : <IoMdMoon />}
        </i>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-[#9933ff] px-4 py-2 rounded-lg text-white font-semibold hover:opacity-80 transition-all">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton />
        </SignedIn>

      </div>
    </div>
  )
}

export default Navbar;