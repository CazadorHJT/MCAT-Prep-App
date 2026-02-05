import React from 'react';

const ChapterList = ({ chapters, onSelectChapter }) => {
  return (
    <div>
      <h3>Chapters</h3>
      <ul>
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <button onClick={() => onSelectChapter(chapter.id)}>
              {chapter.chapter_number}. {chapter.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChapterList;
