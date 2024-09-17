import os
import re
from bs4 import BeautifulSoup
import markdownify
import markdown
import html2text
import pypandoc

def convert_html_to_markdown(html_content: str) -> str:
    soup = BeautifulSoup(html_content, 'html.parser')

    for font_tag in soup.find_all('font'):
        font_tag.unwrap()

    for center_tag in soup.find_all('center'):
        center_tag.unwrap()

    # add ``` to where <pre> tags are
    for pre_tag in soup.find_all('pre'):
        pre_tag.insert_before('```\n')
        pre_tag.insert_after('\n```')
        pre_tag.unwrap()

    # Handle both footnote-like <a name="..."> and regular <a href="...">
    for a_tag in soup.find_all('a'):
        # Handle footnotes with the 'name' attribute
        if 'name' in a_tag.attrs:
            name = a_tag['name']
            num = re.sub(r'\D', '', name)
            a_tag.replace_with(f'<a id="{name}" name="{name}" class="footnote">{num}</a>')
        
        # Handle links with the 'href' attribute
        elif 'href' in a_tag.attrs:
            href = a_tag['href']
            text = a_tag.get_text()

            # If it's an internal link (starts with '#'), convert to a Markdown link
            if href.startswith('#'):
                num = re.sub(r'\D', '', href)
                a_tag.replace_with(f'[{num}]({href})')
            
            # If it's a local HTML file, convert to a full URL
            elif href.endswith('.html') and not href.startswith('http'):
                href = f'https://paulgraham.com/{href}'
                a_tag.replace_with(f'[{text}]({href})')

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

    # Remove extra whitespace
    markdown_content = re.sub(r'\n[ \t]+', '\n', markdown_content)
    markdown_content = re.sub(r'[ \t]+\n', '\n', markdown_content)
    # Remove extra newlines
    markdown_content = re.sub(r'\n{3,}', '\n\n', markdown_content).strip()
    # Remove extra whitespace around links
    markdown_content = re.sub(r'{" "}', ' ', markdown_content)

    return markdown_content

def convert_and_save(html_file_path, md_file_path):
    with open(html_file_path, 'r') as file:
        html_content = file.read()
        markdown = convert_html_to_markdown(html_content)
        with open(md_file_path, 'w') as file:
            file.write(markdown)

def parse_html(html_file_path=None, html_content=None):
    if html_file_path:
        html_content = pypandoc.convert_file(html_file_path, 'html')
    if html_content:
        md = pypandoc.convert_text(
            html_content,
            to='markdown_strict+backtick_code_blocks',
            format='html',
            extra_args=['--wrap=preserve', '--markdown-headings=atx']
        )
        return md
    else:
        return None

def parse_markdown(md_file_path):
    import re
    import pypandoc
    from bs4 import BeautifulSoup, NavigableString, Tag

    with open(md_file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Extract the title from the Markdown content
    title_match = re.search(r'^title:\s*(.*)', content, re.MULTILINE)
    if title_match:
        title = title_match.group(1)
    else:
        title = ''

    # Convert Markdown to HTML using Pandoc
    html = pypandoc.convert_text(
        content,
        to='html',
        format='markdown_strict+yaml_metadata_block+backtick_code_blocks',
        extra_args=['--wrap=preserve']
    )

    # Parse the HTML with BeautifulSoup
    soup = BeautifulSoup(html, 'html.parser')

    # Process <pre><code> blocks to insert <br /> on empty lines
    for pre in soup.find_all('pre'):
        code = pre.find('code')
        if code and code.string:
            # Capture the original code content
            original_code = code.string
            # Clear the code block contents
            code.clear()
            # Split the original code content into lines
            code_lines = original_code.split('\n')
            for idx, line in enumerate(code_lines):
                # For each line, add it as NavigableString
                code.append(NavigableString(line))
                # If it's not the last line, add a newline
                if idx < len(code_lines) - 1:
                    code.append('\n')
                # If the line is empty, insert two <br /> tags
                if line.strip() == '':
                    for _ in range(2):
                        br_tag = soup.new_tag('br')
                        code.append(br_tag)



    # Prepend the title if it exists
    if title:
        h1_tag = soup.new_tag('h1')
        h1_tag.string = title
        soup.insert(0, h1_tag)

    # Get the modified HTML as a string
    modified_html = str(soup)

    return modified_html

def parse_all_markdown_to_english_html():
    if not os.path.exists('essaysHTMLenglish'):
        os.makedirs('essaysHTMLenglish')
    for mdFile in os.listdir('essaysMDenglish'):
        if os.path.exists(f'essaysHTMLenglish/{mdFile.replace(".md", ".html")}'):
            print(f'Skipping {mdFile} as it already exists')
            continue
        html = parse_markdown(f'essaysMDenglish/{mdFile}')
        with open(f'essaysHTMLenglish/{mdFile.replace(".md", ".html")}', 'w') as file:
            file.write(html)

def parse_all_html_to_markdown(target_language):
    for htmlFile in os.listdir(f'essaysHTML{target_language}-cloud_translation'):
        if os.path.exists(f'essaysMD{target_language}-google-NMT/{htmlFile.replace(".html", ".md")}'):
            print(f'Skipping {htmlFile} as it already exists')
            continue
        md = parse_html(f'essaysHTML{target_language}-cloud_translation/{htmlFile}')
        if not os.path.exists(f'essaysMD{target_language}-google-NMT'):
            os.makedirs(f'essaysMD{target_language}-google-NMT')
        with open(f'essaysMD{target_language}-google-NMT/{htmlFile.replace(".html", ".md")}', 'w') as file:
            file.write(md)

if __name__ == '__main__':
    target_language = 'french'