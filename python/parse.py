import os
import re
from bs4 import BeautifulSoup

def convert_html_to_markdown(html_content: str) -> str:
    soup = BeautifulSoup(html_content, 'html.parser')

    for font_tag in soup.find_all('font'):
        font_tag.unwrap()

    for center_tag in soup.find_all('center'):
        center_tag.unwrap()

    # Handle both footnote-like <a name="..."> and regular <a href="...">
    for a_tag in soup.find_all('a'):
        # Handle footnotes with the 'name' attribute
        if 'name' in a_tag.attrs:
            name = a_tag['name']
            footnote_number = name[1]
            a_tag.replace_with(f'###### {footnote_number}')
        
        # Handle links with the 'href' attribute
        elif 'href' in a_tag.attrs:
            href = a_tag['href']
            text = a_tag.get_text()

            # If it's an internal link (starts with '#'), convert to a Markdown link
            if href.startswith('#'):
                a_tag.replace_with(f'[{href[2]}](#{href[2]})')
            
            # If it's a local HTML file, convert to a full URL
            elif href.endswith('.html') and not href.startswith('http'):
                href = f'https://paulgraham.com/{href}'

            else:
                # Regular links stay as-is
                a_tag.replace_with(f'[{text}]({href})')

    for b_tag in soup.find_all('b'):
        content = b_tag.decode_contents()
        b_tag.replace_with(f'**{content.strip()}**')

    for i_tag in soup.find_all('i'):
        content = i_tag.decode_contents() 
        i_tag.replace_with(f'*{content.strip()}*')

    for xmp_tag in soup.find_all('xmp'):
        content = xmp_tag.string if xmp_tag.string else xmp_tag.decode_contents()
        xmp_tag.replace_with(f'```\n{content}\n```')

    for br_tag in soup.find_all('br'):
        br_tag.insert_after('\n\n')
        br_tag.unwrap()

    markdown_content = soup.get_text()
    
    if markdown_content.startswith(';'):
        markdown_content = markdown_content[1:]

    markdown_content = re.sub(r'\[\s*(###### \d+)\s*\]', r'\1\n', markdown_content)

    markdown_content = re.sub(r'\n[ \t]+', '\n', markdown_content)
    markdown_content = re.sub(r'[ \t]+\n', '\n', markdown_content)

    markdown_content = re.sub(r'\n{3,}', '\n\n', markdown_content).strip()

    return markdown_content

for htmlFile in os.listdir('essaysHTML'):
    with open(f'essaysHTML/{htmlFile}', 'r') as file:
        html_content = file.read()
        markdown = convert_html_to_markdown(html_content)
        with open(f'essaysMD/{htmlFile.replace(".html", ".md")}', 'w') as file:
            file.write(markdown)

