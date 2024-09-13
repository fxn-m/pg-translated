import json
import os
import openai
import anthropic
import argparse
from metadata import overwrite_metadata
from concurrent.futures import ThreadPoolExecutor, as_completed
from helpers import sort_essays_by_length, shortest_100_essays

originalDirectory = './essaysMDenglish'

parser = argparse.ArgumentParser()
parser.add_argument("-lang", "--language", help="Language to translate to", type=str)
parser.add_argument("-model", "--model", help="Model", type=int)
args = parser.parse_args()

TARGET_LANGUAGE = args.language
with open("./supported_languages.json", "r") as f:
    supported_languages = json.load(f)["supported_languages"]

if TARGET_LANGUAGE not in supported_languages:
    print(f"Language {TARGET_LANGUAGE} is not supported.")
    exit()

try: 
    MODEL_NAME = {
        1: "gpt-4o-mini",
        2: "claude-3-haiku-20240307",
        3: "llama-3-7b",
    }[args.model]
except KeyError:
    print(f"Model {args.model} is not supported.")
    exit()

LLM_PROVIDER = {
    "gpt-4o-mini": "openai",
    "claude-3-haiku-20240307": "anthropic",
    "llama-3-7b": "meta"
}[MODEL_NAME]

print(f"Translating to {args.language.capitalize()} with {MODEL_NAME}...")    

def translate_markdown(content, target_language):
    """
    Translate the given markdown content to the target language.

    Args:
    content (str): The markdown content to translate.
    target_language (str): The target language to translate the content to.
    """

    prompt = f"Translate the following content to {target_language}.\
    The content is in markdown format, which must be preserved. That means keeping all of the links like this [[1](#f1n)] \
    Do not include any additional text, like ```markdown. \
    Do not include any additional text like 'Here is the translation of the content:'. \
    Do not add anything to the beginning or end of the content. It MUST start with the metadata. \
    The metadata keys are: title, date. \
    The metadata keys MUST NOT be translated. \
    The metadata title MUST be translated. I repeat, you MUST translate the value of the title: field \
    If there is no content beyond the metadata, the translation should be empty. Don't return anything \
    \n\nContent: {content}"

    if LLM_PROVIDER == "openai":
        client = openai.Client(api_key=os.environ.get("OPENAI_API_KEY"))
        try:
            response = client.chat.completions.create(
                model=MODEL_NAME, 
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
                stream=True
            )

            collected_messages = []

            for chunk in response:
                chunk_message = chunk.choices[0].delta.content
                print(chunk_message, end="", flush=True)
                collected_messages.append(chunk_message)

            collected_messages = [m for m in collected_messages if m is not None]
            translation = "".join(collected_messages)
            return translation
        
        except Exception as e:
            print(f"Error during translation: {e}")
            return None
        
    elif LLM_PROVIDER == "anthropic":
        client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
        try:
            collected_messages = []

            with client.messages.stream(
                system="You are a world-class translator.",
                messages=[{"role": "user", "content": prompt}],
                model=MODEL_NAME,
                temperature=0,
                max_tokens=4096,
            ) as stream:
                
                for text in stream.text_stream:
                    print(text, end="", flush=True)
                    collected_messages.append(text)

            collected_messages = [m for m in collected_messages if m is not None]
            translation = "".join(collected_messages)
            return translation
        
        except Exception as e:
            print(f"Error during translation: {e}")
            return None

def translate_all_markdown_files(target_language):
    if not os.path.exists(originalDirectory):
        print(f"Directory {originalDirectory} does not exist.")
        return
    
    output_directory = f"./essaysMD{target_language}-{MODEL_NAME.lower()}"
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)
    
    for filename in os.listdir(originalDirectory):
        if filename.endswith(".md"):

            # if the file already exists in the output directory, skip it
            if os.path.exists(os.path.join(output_directory, filename)):
                print(f"Skipping {filename} as it already exists in the output directory.")
                continue

            file_path = os.path.join(originalDirectory, filename)
            
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            print(f"Translating {filename} to {target_language}...")
            translated_content = translate_markdown(content, target_language)
            
            if translated_content:
                translated_file_path = os.path.join(output_directory, filename)
                with open(translated_file_path, 'w', encoding='utf-8') as translated_file:
                    translated_file.write(translated_content)
                
                print(f"Saved translated file: {translated_file_path}")
            else:
                print(f"Failed to translate {filename}")
    
    print("Translation process completed.")

def translate_one_markdown_file(target_language, file_name):
    file_path = os.path.join(originalDirectory, file_name)
    output_directory = f"./essaysMD{target_language.lower()}-{MODEL_NAME.lower()}"

    print(f"Translating {file_path} to {target_language}...")

    if not os.path.exists(output_directory):
        os.makedirs(output_directory)
        
    if os.path.exists(os.path.join(output_directory, file_name)):
        print(f"Skipping {file_name} as it already exists in the output directory.")
        return
    
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()   
    translated_content = translate_markdown(content, target_language)

    if translated_content:
        translated_file_path = f"{output_directory}/{file_name}"
        with open(translated_file_path, 'w', encoding='utf-8') as translated_file:
            translated_file.write(translated_content)
                
        print(f"\n\nSaved translated file: {translated_file_path}")
    else:
        print(f"\n\nFailed to translate {file_path}")

    print("Translation process completed.")

BATCH_SIZE = 5

def translate_batch(file_batch, target_language, output_directory):
    for file_name in file_batch:
        file_path = os.path.join(originalDirectory, file_name)
        
        # Skip if file already exists in the output directory
        if os.path.exists(os.path.join(output_directory, file_name)):
            print(f"Skipping {file_name} as it already exists in the output directory.")
            continue
        
        # Read the markdown content
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Translate the markdown content
        translated_content = translate_markdown(content, target_language)

        if translated_content:
            # Save the translated content to the output directory
            translated_file_path = os.path.join(output_directory, file_name)
            with open(translated_file_path, 'w', encoding='utf-8') as translated_file:
                translated_file.write(translated_content)
            print(f"Saved translated file: {translated_file_path}")
        else:
            print(f"Failed to translate {file_name}")

def translate_all_markdown_files_in_batches(target_language):
    if not os.path.exists(originalDirectory):
        print(f"Directory {originalDirectory} does not exist.")
        return
    
    output_directory = f"./essaysMD{target_language.lower()}-{MODEL_NAME.lower()}"
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    markdown_files = list(sort_essays_by_length())

    file_batches = [markdown_files[i:i + BATCH_SIZE] for i in range(0, len(markdown_files), BATCH_SIZE)]
    
    with ThreadPoolExecutor() as executor:
        futures = []
        
        for batch in file_batches:
            futures.append(executor.submit(translate_batch, batch, target_language, output_directory))
        
        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                print(f"Error occurred in a batch: {e}")
    
    print("Translation process completed.")

if __name__ == "__main__":
    translate_all_markdown_files_in_batches(TARGET_LANGUAGE.capitalize())
    overwrite_metadata(TARGET_LANGUAGE.lower(), MODEL_NAME)
