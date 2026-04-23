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
  <div className="mt-8 ml-[5vw] w-[90vw]">
    
    <h4 className="text-lg font-semibold text-white mb-3">
      Recent Searches
    </h4>

    <div className="flex gap-3 overflow-x-auto pb-2">
      {searches.length === 0 ? (
        <div className="text-gray-400 text-sm">
          No recent searches yet
        </div>
      ) : (
        searches.map((item) => (
          <div
            key={item._id}
            onClick={() => setPrompt(item.prompt)}
            className="relative min-w-[250px] bg-white/5 backdrop-blur-md border border-white/10 
                       hover:border-purple-500 hover:bg-white/10 
                       transition-all duration-300 
                       p-3 rounded-lg cursor-pointer group"
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

            <p className="text-sm text-gray-300 group-hover:text-white truncate">
              {item.prompt}
            </p>

            <span className="text-xs text-gray-500">
              {new Date(item.createdAt).toLocaleString()}
            </span>
          </div>
        ))
      )}
    </div>

  </div>
);
}