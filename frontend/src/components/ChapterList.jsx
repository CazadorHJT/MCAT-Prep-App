import React from 'react';

const ChapterList = ({ chapters, onSelectChapter }) => {
  if (chapters.length === 0) {
    return (
      <div className="empty-state">
        <p>No chapters found for this book.</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Select a Chapter to Start</h3>
      <ul className="chapter-list">
        {chapters.map((chapter) => (
          <li key={chapter.id} className="chapter-item">
            <button
              className="chapter-button"
              onClick={() => onSelectChapter(chapter.id)}
            >
              <span className="chapter-number">{chapter.chapter_number}</span>
              <span className="chapter-title">{chapter.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChapterList;
