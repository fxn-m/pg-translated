import json
import os
import openai
from countWords import *
import argparse

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
        2: "claude-3-haiku",
        3: "llama-3-7b",
    }[args.model]
except KeyError:
    print(f"Model {args.model} is not supported.")
    exit()

LLM_PROVIDER = {
    "gpt-4o-mini": "openai",
    "claude-3-haiku": "anthropic",
    "llama-3-7b": "meta"
}[MODEL_NAME]

print(f"Translating to {args.language.capitalize()} with {MODEL_NAME}...")    

client = openai.Client(api_key=os.environ.get("OPENAI_API_KEY"))

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
    \n\nContent: {content}"
    
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

def translate_all_markdown_files(target_language):
    # TODO: PARALLELIZE THIS

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
                translated_file_path = os.path.join(output_directory, f"{filename[:-3]}_{target_language}.md")
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

if __name__ == "__main__":
    translate_one_markdown_file(TARGET_LANGUAGE.capitalize(), "foundermode.md")
    # # translate shortest 100 files
    # for essay in shortest_100_essays():
    #     translate_one_markdown_file(TARGET_LANGUAGE.capitalize(), essay)