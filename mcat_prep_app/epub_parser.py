import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup

def get_book_chapters(book_path):
    """
    Reads an EPUB file and extracts chapters (title and content) from the table of contents.
    """
    book = epub.read_epub(book_path)
    chapters = []
    
    # A mapping from href to book item
    href_map = {item.file_name: item for item in book.get_items()}

    def _get_content_from_href(href):
        # The href can contain an anchor, remove it
        href_without_anchor = href.split('#')[0]
        item = href_map.get(href_without_anchor)
        if item:
            content = item.get_content()
            soup = BeautifulSoup(content, 'html.parser')
            return soup.get_text()
        return ""

    def _extract_toc(toc_items):
        for item in toc_items:
            if isinstance(item, tuple):
                # This is a nested chapter, recurse into it
                _extract_toc(item[1])
            else:
                title = item.title
                # The href is in the first element of the item
                href = item.href
                content = _get_content_from_href(href)
                chapters.append({'title': title, 'content': content})

    _extract_toc(book.toc)
    return chapters

if __name__ == '__main__':
    # Example usage:
    # This assumes the script is run from the root of the project.
    book_path = "Review Book Files/KAPLAN MCAT BIOLOGY REVIEW 2024-2025 - online + book -- Kaplan Test Prep -- 2024 -- Kaplan Test Prep -- 9781506286853 -- f8c58760a8363b5fb3236bc78e1132d4 -- Anna’s Archive.epub"
    try:
        chapters = get_book_chapters(book_path)
        print("Chapters found:")
        for chapter in chapters[:5]: # Print first 5 chapters
            print(f"- Title: {chapter['title']}")
            print(f"  Content snippet: {chapter['content'][:200]}...") # Print first 200 chars
    except FileNotFoundError:
        print(f"Error: The file was not found at {book_path}")
    except Exception as e:
        print(f"An error occurred: {e}")
