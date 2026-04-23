import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";

export default function RecentSearches({ userId, refresh, setPrompt }) {
  const [searches, setSearches] = useState([]);

  // 🔹 Fetch searches
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/searches?userId=${userId}`)
      .then(res => res.json())
      .then(data => setSearches(data.searches || []));
  }, [userId, refresh]);

  // 🔹 Delete function
  const handleDelete = async (id) => {
    try {
      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/searches/${id}?userId=${userId}`,
        { method: "DELETE" }
      );

      // instant UI update
      setSearches(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

 return (
  <div className="mt-8 w-full">
    
      <h4 className="text-lg font-semibold mb-3 recentTitle" style={{color: 'var(--color-text)'}}>
  Recent Searches
      </h4>

    <div className="flex gap-3 overflow-x-auto pb-2 recentScrollbar">
      {searches.length === 0 ? (
        <div className="text-gray-400 text-sm">
          No recent searches yet
        </div>
      ) : (
        searches.map((item) => (
          <div
             key={item._id}
             onClick={() => setPrompt(item.prompt)}
             className="recentCard relative min-w-[250px] backdrop-blur-md
             transition-all duration-300 
             p-3 rounded-lg cursor-pointer group
             bg-white/5 border border-white/10
             hover:border-purple-500 hover:bg-white/10"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item._id);
              }}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-400"
            >
              <IoMdClose size={16} />
            </button>

            <p className="promptText text-sm truncate" style={{color: 'var(--color-text-desc)'}}>
            {item.prompt}
            </p>
            <span className="dateText text-xs" style={{color: 'var(--color-text-dim)'}}>
            </span>
          </div>
        ))
      )}
    </div>

  </div>
);
}
