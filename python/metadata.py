import re
from bs4 import BeautifulSoup
import os
import yaml
import datetime

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

def process_all_links(language, model):
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

        markdown_file_path = f"{CURRENT_DIR}/essaysMD{language}-{model}/{href.split('.html')[0]}.md"

        generate_metadata(markdown_file_path, title)

def overwrite_metadata(lang, model="gpt-4o-mini"):
    """Copy metadata from english .md files to translated ones, adding translated_title."""

    translated_dir = f"{CURRENT_DIR}/essaysMD{lang}-{model}"
    error_count = 0

    for filename in os.listdir(translated_dir):
        if filename.endswith(".md"):
            file_path = os.path.join(translated_dir, filename)

            # read the metadata from the original file in english
            with open(f"{CURRENT_DIR}/essaysMDenglish/{filename}", 'r', encoding='utf-8') as file:
                original_content = file.read()

            # extract metadata from the original file
            original_metadata_match = re.search(r'^---(.*?)---', original_content, re.DOTALL)
            if original_metadata_match:
                original_metadata = yaml.safe_load(original_metadata_match.group(1))
                print(f"\nMetadata extracted from {filename}")
            else:
                print(f"No metadata found in {filename}")
                continue

            date = original_metadata.get('date')
            if date == "None" or date == None:
                print(f"No date found in {filename}")
                continue

            date_parts = re.split('[,(]', date)
            date = date_parts[0].strip()
            date = datetime.datetime.strptime(date, '%B %Y')
            date = date.strftime('%B %Y')
            original_metadata['date'] = date

            # read the translated file
            with open(file_path, 'r', encoding='utf-8') as file:
                translated_content = file.read()

            # extract metadata from the translated file
            translated_metadata_match = re.search(r'^---(.*?)---', translated_content, re.DOTALL)
            if translated_metadata_match:
                translated_metadata = yaml.safe_load(translated_metadata_match.group(1))
                print(f"Translated metadata extracted from {filename}")
            else:
                print(f"\033[91mNo metadata found in the translated file for {filename}\033[0m")
                error_count += 1

                # # remove the first two lines of the file (removes any pre-amble added by the translation tool)
                # with open(file_path, 'r', encoding='utf-8') as file:
                #     lines = file.readlines()
                #     lines = lines[2:]
                # with open(file_path, 'w', encoding='utf-8') as file:
                #     file.writelines(lines)

                continue

            if translated_metadata.get('translated_title'):
                print(f"Translated title already exists in {filename}, skipping...")
                continue

            # create new metadata by adding translated_title and preserving original title and date
            updated_metadata = {
                'title': original_metadata.get('title', ''),
                'translated_title': translated_metadata.get('title', ''),
                'date': original_metadata.get('date', '')
            }

            new_metadata_section = f"---\n{yaml.dump(updated_metadata, allow_unicode=True)}---"
            print("New metadata section:", new_metadata_section)

            # update the metadata in the translated file content
            updated_content = re.sub(r'^---(.*?)---', new_metadata_section, translated_content, flags=re.DOTALL)

            # overwrite the file with the updated content
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(updated_content)

            print(f"Metadata copied to {filename}")

    if error_count: print(f"\n{error_count} errors.")

def remove_extra_metadata(lang, model="gemini-1.5-flash"):
    """Remove extra metadata from translated .md files."""

    translated_dir = f"{CURRENT_DIR}/essaysMD{lang}-{model}"
    error_count = 0

    for filename in os.listdir(translated_dir):
        if filename.endswith(".md"):
            file_path = os.path.join(translated_dir, filename)

            with open(file_path, 'r', encoding='utf-8') as file:
                translated_content = file.read()

            match = re.search(r'^---.*?---', translated_content, re.DOTALL | re.MULTILINE)

            if match:
                first_metadata_block = match.group(0)
                rest_of_content = translated_content[match.end():]
                rest_of_content = re.sub(r'^---\s*\ntitle:\s*.*\s*\ndate:\s*.*\s*\n---\s*', '', rest_of_content, flags=re.MULTILINE)
                new_content = first_metadata_block + rest_of_content

                with open(file_path, 'w', encoding='utf-8') as file:
                    file.write(new_content)
            else:
                error_count += 1
                print(f"No metadata block found in file: {filename}")

    print(f"Processing complete. Number of files without metadata: {error_count}")

def add_metadata_to_gcp_translations(lang):
    """Add metadata to translated files generated by GCP."""
    translated_dir = f"{CURRENT_DIR}/essaysMD{lang}-google-NMT"

    for filename in os.listdir(translated_dir):
        if filename.endswith(".md"):
            file_path = os.path.join(translated_dir, filename)

            with open(f"{CURRENT_DIR}/essaysMDenglish/{filename}", 'r', encoding='utf-8') as file:
                original_content = file.read()

            original_metadata = re.search(r'^---(.*?)---', original_content, re.DOTALL).group(1)
            original_metadata = yaml.safe_load(original_metadata)
            original_title = original_metadata.get('title')
            date = original_metadata.get('date')

            with open(file_path, 'r', encoding='utf-8') as file:
                translated_content = file.read()

            translated_metadata = re.search(r'^---(.*?)---', translated_content, re.DOTALL)
            if translated_metadata:
                translated_metadata = yaml.safe_load(translated_metadata.group(1))

                if translated_metadata.get("translated_title"):
                    print(f"Translated title already exists in {filename}, skipping...")
                    continue
            
            # the top line is a #h1 title, extract it and the rest of the content
            translated_title = translated_content.split('\n')[0].strip('# ')
            translated_content = '\n'.join(translated_content.split('\n')[1:])
            # create new metadata by adding translated_title and preserving original title and date
            updated_metadata = {
                'title': original_title,
                'translated_title': translated_title,
                'date': date
            }

            new_metadata_section = f"---\n{yaml.dump(updated_metadata, allow_unicode=True)}---"
            # update the metadata in the translated file content
            translated_content = new_metadata_section + translated_content
            # overwrite the file with the updated content
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(translated_content)
                print(f"Metadata added to {filename}")

if __name__ == "__main__":
    language = 'chinese'
    model = 'gemini-1.5-flash'
    remove_extra_metadata(language, model)