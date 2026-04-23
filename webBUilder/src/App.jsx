import React, { useState, useEffect } from 'react';
import "./App.css"
import Navbar from './components/Navbar'
import { MdOutlineArrowUpward } from "react-icons/md";
import { ImNewTab } from "react-icons/im";
import { IoMdDownload } from "react-icons/io";
import { BiSolidShow } from "react-icons/bi";
import { FaEyeSlash } from "react-icons/fa";
import Editor from '@monaco-editor/react';
import { RiComputerLine } from "react-icons/ri";
import { FaTabletAlt } from "react-icons/fa";
import { ImMobile2 } from "react-icons/im";
import { IoMdClose } from "react-icons/io";

import { toast } from 'react-toastify';
import { FadeLoader } from 'react-spinners';
import RecentSearches from "./components/RecentSearches";

import { useUser } from '@clerk/clerk-react';
 
const App = () => {
  const { user } = useUser();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isShowCode, setIsShowCode] = useState(false);
  const [isInNewTab, setIsInNewTab] = useState(false);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(
    `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="p-[10px]">
  <h1 class="text-[30px] font-[700]">Welcome to WebBuilder</h1>
</body>
</html>
    `
  );
  const toggleTheme = () => {
  setIsDarkMode(prev => !prev);
};
 
// ✅ ADD THIS
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
    }
  }, [isDarkMode]);

  
  
 
  
  function extractCode(response) {
    const match = response.match(/```(?:\w+)?\n?([\s\S]*?)```/);
    return match ? match[1].trim() : response.trim();
  };
 
  const downloadCode = ()=> {
    let filename = "webBuilderCode.html";
    let blob = new Blob([code], {type: "text/plain"});
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };
 
//   
async function getResponse() {
  if (!user?.id) {
    toast.error("Please sign in first!");
    return;
  }
  
  if (prompt === "") {
    toast.error("Please enter a prompt!");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
      prompt: prompt,
      userId: user?.id,
      userEmail: user?.primaryEmailAddress?.emailAddress ?? ""
})
    });

    const data = await res.json();

    if (data.code) {
      setCode(data.code);
    } else {
      toast.error("Failed to generate code");
    }

  } catch (err) {
    console.error(err);
    toast.error("Server error!");
  }

  setLoading(false);
}
 
 
  return (
    <>
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <div className="container">
        <h3 className='text-[30px] font-[700]'>Create beautiful websites with <span className='bg-gradient-to-br from-violet-400  to-purple-600 bg-clip-text text-transparent'>WebBuilder</span></h3>
        <p className='mt-2 text-[16px] text-[#b3b3b3]'>Describe your website and ai will code for you.</p>
 
        <div className="inputBox">
          <textarea onChange={(e) => { setPrompt(e.target.value) }} value={prompt} placeholder='describe your website in detail.'></textarea>
          {
            prompt !== "" ?
              <>
                <i onClick={getResponse} className='sendIcon text-[20px] w-[30px] h-[30px] flex items-center justify-center bg-[#9933ff] rounded-[50%] transition-all duration-300 hover:opacity-[.8]'><MdOutlineArrowUpward /></i>
              </> : ""
          }
        </div>

        <div className="historyWrapper">
            {user?.id && (
  <RecentSearches userId={user.id} refresh={refresh} setPrompt={setPrompt} />
            )}

        </div>
 
        <p className='text-[20px] font-[700] mt-[10vh]'>Your AI-Genreated Website will appear here.</p>
        

        
        <div className="preview ">
          <div className="header w-full h-[70px]">
            <h3 className='font-bold text-[16px]'>Live Preview</h3>
 
            <div className="icons flex items-center gap-[8px] md:gap-[15px]">
  <div onClick={() => { setIsInNewTab(true) }} className="icon !w-[auto] !p-[8px] md:!p-[12px] flex items-center gap-[6px] text-[13px] md:text-[14px]">
    <span className="hidden sm:inline">Open in new tab</span> <ImNewTab />
  </div>
  <div onClick={downloadCode} className="icon !w-[auto] !p-[8px] md:!p-[12px] flex items-center gap-[6px] text-[13px] md:text-[14px]">
    <span className="hidden sm:inline">Download</span> <IoMdDownload />
  </div>
  <div onClick={() => { setIsShowCode(!isShowCode) }} className="icon !w-[auto] !p-[8px] md:!p-[12px] flex items-center gap-[6px] text-[13px] md:text-[14px]">
    <span className="hidden sm:inline">{isShowCode ? "Hide Code" : "Show Code"}</span>
    {isShowCode ? <FaEyeSlash /> : <BiSolidShow />}
  </div>
</div>
          </div>
 
          {
            isShowCode ? <>
              <Editor onChange={(code)=>{setCode(code)}} height="100%" theme='vs-dark' defaultLanguage="html" value={code} />
            </> : <>
              {
                loading ?
                  <div className='w-full h-full flex items-center justify-center flex-col'>
                    <FadeLoader color='#9933ff'/>
                    <h3 className='text-[23px] mt-4 font-semibold'><span className='bg-gradient-to-br from-violet-400  to-purple-600 bg-clip-text text-transparent'>Generating</span> your website...</h3>
                  </div> :
                  <>
                    
                    <iframe srcDoc={code} className='w-full h-[80vh] bg-[white]'></iframe>
                  </>
              }
            </>
          }
        </div>
        
 
      </div>
 
 
      {
        isInNewTab ?
          <>
            <div className="modelCon">
              <div className="modelBox text-black">
                <div className="header w-full px-[50px] h-[70px] flex items-center justify-between ">
                  <h3 className='font-[700]'>Preview</h3>
 
                  <div className="icons flex items-center gap-[15px]">
                    <div className="icon"><RiComputerLine /></div>
                    <div className="icon"><FaTabletAlt /></div>
                    <div className="icon"><ImMobile2 /></div>
                  </div>
 
                  <div className="icons">
                    <div className="icon" onClick={() => { setIsInNewTab(false) }}><IoMdClose /></div>
                  </div>
                </div>
                <iframe srcDoc={code} className='w-full newTabIframe'></iframe>
              </div>
            </div>
          </> : ""
      }
    </>
  )
}
 
export default App


