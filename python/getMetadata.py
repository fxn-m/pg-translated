"""
Get the titles and hrefs of the essays from the articles.html file.

Add the titles as metadata to the corresponding essays in the essaysMDenglish directory.

The files can be identified by the hrefs in the articles.html file, which are the filenames of the essays in the essaysMDenglish directory.
"""

from bs4 import BeautifulSoup
import os

CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))

# read articles from file
with open('articles.html', 'r') as file:
    articles = file.read()

soup = BeautifulSoup(articles, 'html.parser')
soup.prettify()

links = soup.findAll('a')

for i, link in enumerate(links):

    title = link.text
    href = link['href']

    if "Chapter " in title:
        continue

    markdown_file_path = f"{CURRENT_DIR}/essaysMDenglish/{href.split('.html')[0]}.md"
    print(f"\nAdding metadata to {markdown_file_path}...")
    print("Title:", title)