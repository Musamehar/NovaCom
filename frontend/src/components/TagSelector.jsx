import React from 'react';

const STATIC_TAGS = ["Gaming", "Anime", "Movies", "Student", "Adult", "Teen"];

const TagSelector = ({ selectedTags, setSelectedTags }) => {
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      if (selectedTags.length > 1) { // Require at least one
        setSelectedTags(selectedTags.filter(t => t !== tag));
      }
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {STATIC_TAGS.map(tag => (
        <button
          key={tag}
          type="button"
          onClick={() => toggleTag(tag)}
          className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
            selectedTags.includes(tag) 
              ? 'bg-cyan-supernova text-black border-cyan-supernova' 
              : 'bg-transparent text-gray-400 border-gray-600 hover:border-white'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default TagSelector;