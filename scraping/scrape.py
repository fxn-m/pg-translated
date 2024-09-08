import urllib.request
from bs4 import BeautifulSoup
import os

CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))

def scrapeEssay(link, title):
    if not 'http' in link:
        page = urllib.request.urlopen('http://www.paulgraham.com/' + link).read()
        soup = BeautifulSoup(page, 'html5lib')
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

# page = urllib.request.urlopen('http://www.paulgraham.com/articles.html').read()
# soup = BeautifulSoup(page, 'html5lib')
# soup.prettify()
# intermediate = soup.findAll('table', {'width': '435'})

# # save intermediate to file
# with open('intermediate.html', 'w') as file:
#     file.write(str(intermediate))
#     print("file written")

# read intermediate from file
with open('intermediate.html', 'r') as file:
    intermediate = file.read()

soup = BeautifulSoup(intermediate, 'html5lib')
soup.prettify()

links = soup.findAll('a')
print("len(links)", len(links)) 

print("links[3]", links[3])
print("links[3].attrs", links[3].attrs)
print("links[3].text", links[3].text)   
print("links[3]['href']", links[3]['href'])

essay = scrapeEssay(links[3]['href'], links[3].text)

# write essay to file
with open('essay.html', 'w') as file:
    for p in essay:
        file.write(p)
        file.write("\n\n")
    print("file written")

# # # read essay from file
# with open('essay.html', 'r') as file:
#     essay = file.read()

# soup = BeautifulSoup(essay, 'html5lib')
# soup.prettify()
# print(soup.get_text())

# sections = []
# for link in links:
#     # sections.append(addSection(link['href'], link.text))
#     print(link['href'])