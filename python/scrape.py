import urllib.request
from bs4 import BeautifulSoup
import os

CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))

def scrapeEssay(link, title):
    if not 'http' in link:
        page = urllib.request.urlopen('http://www.paulgraham.com/' + link).read()
        soup = BeautifulSoup(page, 'html.parser')
        soup.prettify()
    else:
        page = urllib.request.urlopen(link).read()
        
    try:
        print("\nScraping... %s" % title)
        essay = []

        if not 'http' in link:
            font = str(soup.findAll('table', {'width': '435'})[0].findAll('font')[0])
            if not any(phrase in font for phrase in ['Get funded by', 'Watch how this essay was', 'Like to build things?']) and len(font) >= 100:
                content = font
            else:
                content = ''
                for par in soup.findAll('table', {'width': '435'})[0].findAll('p'):
                    content += str(par)

            for p in content.split("<br /><br />"):
                essay.append(p)

            # exception for Subject: Airbnb
            for pre in soup.findAll('pre'):
                essay.append(str(pre))
        else:
            for p in str(page).replace("\n", "<br />").split("<br /><br />"):
                essay.append(p)
    except Exception as e:
        print(f"Error adding section {title}: {e}")
    
    return essay

page = urllib.request.urlopen('http://www.paulgraham.com/articles.html').read()
soup = BeautifulSoup(page, 'html.parser')
soup.prettify()
articles = soup.findAll('table', {'width': '435'})

# save articles to file
with open('articles.html', 'w') as file:
    file.write(str(articles))
    print("articles.html written")

# read articles from file
with open('articles.html', 'r') as file:
    articles = file.read()

soup = BeautifulSoup(articles, 'html.parser')
soup.prettify()

links = soup.findAll('a')

for i, link in enumerate(links):
     # skip essays that have already been scraped
    if os.path.exists(CURRENT_DIR + '/essays/' + link.text + '.html'):
        print("%d file already exists: %s" % (i, link.text))
        continue

    title = link.text
 
    if '/' in link.text:
        title = link.text.replace('/', '-')


    essay = scrapeEssay(link['href'], link.text)


    with open(CURRENT_DIR + '/essays/' + title + '.html', 'w') as file:
        for p in essay:
            file.write(p)
            file.write("\n\n")
        print("file written: %s" % link.text)
