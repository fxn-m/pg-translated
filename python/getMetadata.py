import re
from bs4 import BeautifulSoup
import os

CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))

def generate_metadata(markdown_file_path, title):
    """Generate and add metadata to a markdown file."""

    if not os.path.exists(markdown_file_path):
        print(f"File {markdown_file_path} does not exist.")
        return

    print(f"\nProcessing {markdown_file_path}...")

    with open(markdown_file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Check if metadata already exists
    if re.search(r'^---', content):
        print("Metadata already exists.")
        return

    # Read the first line of the file to extract the date
    lines = content.split('\n')
    first_line = lines[0]

    date_written = None
    if re.match(r'\b([A-Za-z]*)\s(\d{4})\b', first_line):
        date_written = first_line
        print("Date found:", date_written)
    else:
        print("No date found.")
    
    # Create YAML front matter
    metadata = f"---\ntitle: {title}\ndate: {date_written}\n---\n"
    updated_content = metadata + content

    # Write updated content to file
    with open(markdown_file_path, 'w', encoding='utf-8') as file:
        file.write(updated_content)

    print(f"Metadata added to {markdown_file_path}.")

def process_all_links():
    """Process all links from articles.html"""
    # Read articles from file
    with open('articles.html', 'r') as file:
        articles = file.read()

    soup = BeautifulSoup(articles, 'html.parser')
    soup.prettify()
    links = soup.findAll('a')

    for link in links:
        title = link.text
        href = link['href']

        # Skip ANSI Common Lisp chapters
        if "Chapter " in title:
            continue

        markdown_file_path = f"{CURRENT_DIR}/essaysMDenglish/{href.split('.html')[0]}.md"

        generate_metadata(markdown_file_path, title)

process_all_links()