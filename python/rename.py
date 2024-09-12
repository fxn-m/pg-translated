'''
Rename all files in the essaysHTML directory to the href attribute of the corresponding link in the articles.html file
'''

from bs4 import BeautifulSoup
import os

def main():

    CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))
    with open(CURRENT_DIR + "/articles.html", 'r') as file:
        articles = file.read()

    soup = BeautifulSoup(articles, 'html.parser')
    soup.prettify()

    links = soup.findAll('a')

    essaysDir = os.listdir(CURRENT_DIR + '/essaysHTML')

    for i, link in enumerate(links):
        if 'Chapter' in link.text:
            continue
        title = link.text
        href = link['href']
        href = href.split('.html')[0]

        # if the text exists as a filename in essaysHTML, rename it to the href without the .html extension
        if title + '.html' in essaysDir:
            try:
                os.rename(CURRENT_DIR + '/essaysHTML/' + title + '.html', CURRENT_DIR + '/essaysHTML/' + href + '.html')
                print(f"renamed {title}.html to {href}.html")
            except FileNotFoundError as error:
                print(f"Error renaming {title}.html: {error}")

if __name__ == "__main__":
    main()