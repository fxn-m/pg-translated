import json
import os
import openai
import anthropic
import argparse
from metadata import overwrite_metadata, add_metadata_to_gcp_translations
from concurrent.futures import ThreadPoolExecutor, as_completed
from helpers import sort_essays_by_length
import tiktoken
import re
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from google.cloud import translate_v2 as translate
from parse import parse_all_html_to_markdown

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
        3: "gemini-1.5-flash",
        4: "cloud_translation",
        5: "llama-3-7b",
    }[args.model]
except KeyError:
    print(f"Model {args.model} is not supported.")
    exit()

LLM_PROVIDER = {
    "gpt-4o-mini": "openai",
    "claude-3-haiku-20240307": "anthropic",
    "gemini-1.5-flash": "google",
    "cloud_translation": "google",
    "llama-3-7b": "meta",
}[MODEL_NAME]

safety_settings = [
    {
        "category": HarmCategory.HARM_CATEGORY_HARASSMENT,
        "threshold": HarmBlockThreshold.BLOCK_NONE
    },
    {
        "category": HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        "threshold": HarmBlockThreshold.BLOCK_NONE,
    },
    {
        "category": HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        "threshold": HarmBlockThreshold.BLOCK_NONE,
    },
    {
        "category": HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        "threshold": HarmBlockThreshold.BLOCK_NONE,
    },
]

with open("error.log", "r") as f:
    files_to_skip = f.read().splitlines()

def translate_markdown_chunked(content, target_language, file_name=None):
    """
    Translate the given markdown content to the target language.

    Args:
    content (str): The markdown content to translate.
    target_language (str): The target language to translate the content to.
    """

    if SKIP_FILES and f"{file_name}-{MODEL_NAME}-{TARGET_LANGUAGE}" in files_to_skip:
        print(f"\nSkipping {file_name} as it is in the error log.")
        return None

    def estimate_tokens(text, model_name):
        if model_name.startswith("gpt-"):
            encoding = tiktoken.encoding_for_model(model_name)
        else:
            encoding = tiktoken.get_encoding("cl100k_base")
        tokens = encoding.encode(text)
        return len(tokens)
        
    def split_content_into_chunks(content, max_chunk_tokens, model_name):
        # Split content into paragraphs
        paragraphs = re.split(r'(\n\s*\n)', content)  # Keep the delimiters

        chunks = []
        current_chunk = ''
        current_tokens = 0

        for paragraph in paragraphs:
            paragraph_tokens = estimate_tokens(paragraph, model_name)

            if current_tokens + paragraph_tokens <= max_chunk_tokens:
                current_chunk += paragraph
                current_tokens += paragraph_tokens
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                current_chunk = paragraph
                current_tokens = paragraph_tokens

        if current_chunk:
            chunks.append(current_chunk)

        print('\033[93m')
        for chunk in chunks:
            print(f"Chunk length: {len(chunk)}")
            print(f"Number of tokens in chunk: {estimate_tokens(chunk, model_name)}")
        print('\033[0m')

        return chunks
    
    def translate_chunk(chunk, target_language, model, chunk_number, file_name=None):
        if target_language.lower() == "chinese":
            target_language = "Simplified Chinese"

        if chunk_number == 0:
            prompt = f"""Translate the following content to {target_language}:
The content is in markdown format, which must be preserved. That means keeping all of the links like this [[1](#f1n)]
If there is HTML in the content, it must be preserved.
Do not add any extra templating text, like '```markdown', or '```'.

If there ARE three backticks in the content ```, they MUST be preserved as they are. If there is no closing backtick, do not add one.
Do not add any additional text like 'Here is the translation of the content:'.
Do not add ANYTHING to the beginning or end of the content. 

If there is --- style metadata, it MUST start with the metadata.
The metadata keys are: title, date.
The metadata keys MUST NOT be translated.
The metadata title MUST be translated. I repeat, you MUST translate the value of the 'title' field
\n\nContent:\n
{chunk}
\n\nEnd of content.

Now remember, you must translate the content above to {target_language}. DO NOT ADD ANYTHING TO THE TRANSLATION. JUST TRANSLATE ALL OF THE CONTENT AND RETURN EXACTLY THAT.
KEEP ALL OF THE MARKDOWN AND HTML TAGS FORMATTED CORRECTLY.
Remember, you MUST translate the value of the 'title' field in the metadata. Start the translation with the metadata.
Translate the date *after* the metadata to the target language as well.

Translation:
            """

        else:
            prompt = f"""
Translate the following content to {target_language}:
The content is in markdown format, which must be preserved. That means keeping all of the links like this [[1](#f1n)]
If there is HTML in the content, it must be preserved.

Do not add any extra templating text, like '```markdown', or '```'.
If there ARE three backticks in the content ```, they MUST be preserved as they are. If there is no closing backtick, do not add one.
Do not add any additional text like 'Here is the translation of the content:'.

DO NOT ADD ANYTHING TO THE BEGINNING OR END OF THE CONTENT. JUST TRANSLATE ALL OF THE CONTENT AND RETURN EXACTLY THAT.

\n\nContent:\n 
{chunk}
\n\nEnd of content.

Now remember, you must translate the content above to {target_language}. DO NOT ADD ANYTHING TO THE TRANSLATION. JUST TRANSLATE THE CONTENT AND RETURN EXACTLY THAT.
KEEP ALL OF THE MARKDOWN AND HTML TAGS FORMATTED CORRECTLY.

Most importantly, do not miss anything out. Translate EVERYTHING in the content. Do not add any extra text. Just translate the content as it is.

Translation:
            """

        print(f"\n\nTranslating chunk {chunk_number}...")

        if LLM_PROVIDER == "openai":
            client = openai.Client(api_key=os.environ.get("OPENAI_API_KEY"))
            try:
                collected_messages = []
                response = client.chat.completions.create(
                    model=model, 
                    messages=[{"role": "user", "content": prompt}],
                    temperature=TEMPERATURE,
                    stream=True,
                )

                for chunk in response:
                    chunk_message = chunk.choices[0].delta.content
                    print(chunk_message, end="", flush=True)
                    collected_messages.append(chunk_message)

                collected_messages = [m for m in collected_messages if m is not None]
                translation = "".join(collected_messages)

                return translation

            except Exception as e:
                print('\033[91m' + f"\nError during translation: {e}" + '\033[0m')
                return None

        elif LLM_PROVIDER == "anthropic":
            client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
            try:
                collected_messages = []
                with client.messages.stream(
                    system="You are a world-class translator.",
                    messages=[{"role": "user", "content": prompt}],
                    model=model,
                    temperature=TEMPERATURE,
                    max_tokens=4096,
                ) as stream:

                    for text in stream.text_stream:
                        print(text, end="", flush=True)
                        collected_messages.append(text)
                
                collected_messages = [m for m in collected_messages if m is not None]
                translation = "".join(collected_messages)
                return translation

            except Exception as e:
                print('\033[91m' + f"\nError during translation: {e}" + '\033[0m')
                return None
            
        elif LLM_PROVIDER == "google":
        
            prompt = f"""
Translate the following content to {target_language}:
The content is in markdown format, which must be preserved. That means keeping all of the links like this [[1](#f1n)]
If there is HTML in the content, it must be preserved.
Do not add any extra templating text, like '```markdown', or '```'.

If there ARE three backticks in the content ```, they MUST be preserved as they are. If there is no closing backtick, do not add one.
Do not add any additional text like 'Here is the translation of the content:'.
Do not add ANYTHING to the beginning or end of the content. 

The content is between the line of asterisks. Do not keep any lines of asterisks in the translation.

\n\nContent:
*************************************************
{chunk}
*************************************************
\n\n

Now remember, you must translate the content above to {target_language}. 

DO NOT ADD ANYTHING TO THE TRANSLATION. JUST TRANSLATE ALL OF THE CONTENT AND RETURN EXACTLY THAT.
KEEP ALL OF THE MARKDOWN AND HTML TAGS FORMATTED CORRECTLY.

The content is between the line of asterisks. Do not keep any lines of asterisks in the translation.

Recently we've been having issues with extra metadata being added to the translation. Please ensure that you only translate the content and do not add any extra metadata.
If, and only if the Content starts with ---title: "Title"---, you must translate and add the metadata.

If there is --- style metadata, it MUST start with the metadata.
The metadata keys are: title, date.
The metadata keys MUST NOT be translated.
The metadata title MUST be translated. I repeat, you MUST translate the value of the 'title' field. 

Otherwise, do not add any metadata to the translation. Just translate the content as it is.

Translation:
"""
            genai.configure()
            model = genai.GenerativeModel("gemini-1.5-flash")

            try:
                response = model.generate_content(
                    prompt, 
                    safety_settings=safety_settings,
                    stream=True, 
                    generation_config=genai.types.GenerationConfig(
                        temperature=TEMPERATURE,
                    )
                )

                collected_messages = []

                for chunk in response:
                    print(chunk.text, end="", flush=True)
                    collected_messages.append(chunk.text)

                translation = "".join(collected_messages)
                return translation
            
            except Exception as e:
                if "Unknown field for Candidate: finish_message" in str(e):
                    with open("error.log", "a") as f:
                        if (file_name != None) and (f"{file_name}-{MODEL_NAME}-{TARGET_LANGUAGE}" not in files_to_skip):
                            f.write(f"{file_name}-{MODEL_NAME}-{TARGET_LANGUAGE}\n")
                print('\033[91m' + f"\nError during translation: {e}" + '\033[0m')
                return None
    
    max_chunk_tokens = MODEL_CONTEXT_LENGTHS.get(MODEL_NAME)

    print(f"Max chunk tokens: {max_chunk_tokens}")

    chunks = split_content_into_chunks(content, max_chunk_tokens, MODEL_NAME)
    translated_chunks = []

    for i, chunk in enumerate(chunks):
        print('\033[94m' + f"\n\n\nTranslating chunk of length {len(chunk)}...")
        print(f"Number of tokens in chunk: {estimate_tokens(chunk, MODEL_NAME)}" + '\033[0m')

        translation = translate_chunk(chunk, target_language, MODEL_NAME, chunk_number=i, file_name=file_name)
        if translation:
            translated_chunks.append(translation)
        else:
            print("Failed to translate chunk.")
            return None
        
    return "\n\n".join(translated_chunks)

def translate_batch(file_batch, target_language, output_directory):
    for file_name in file_batch:
        file_path = os.path.join(originalDirectory, file_name)
        
        if os.path.exists(os.path.join(output_directory, file_name)):
            print('\033[93m' + f"Skipping {file_name} as it already exists in the output directory." + '\033[0m')
            continue

        
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()

        print('\033[96m' + f"\n\nTranslating {file_name} to {target_language}...")
        print(f"Translating file of length {len(content)}...\n" + '\033[0m')
        
        translated_content = translate_markdown_chunked(content, target_language, file_name)

        if translated_content:
            translated_file_path = os.path.join(output_directory, file_name)
            with open(translated_file_path, 'w', encoding='utf-8') as translated_file:
                translated_file.write(translated_content)
            print('\033[95m' + f"\n\nSaved translated file: {translated_file_path}" + '\033[0m')
        else:
            print('\033[91m' + f"Failed to translate {file_name}" + '\033[0m')

def translate_all_markdown_files_in_batches(target_language):
    if not os.path.exists(originalDirectory):
        print(f"Directory {originalDirectory} does not exist.")
        return
    
    output_directory = f"./essaysMD{target_language.lower()}-{MODEL_NAME.lower()}"
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    markdown_files = list(sort_essays_by_length())

    file_batches = [markdown_files[i:i + BATCH_SIZE] for i in range(0, len(markdown_files), BATCH_SIZE)]
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = []
        for batch in file_batches:
            futures.append(executor.submit(translate_batch, batch, target_language, output_directory))
        
        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                print('\033[91m' + f"Error occurred in a batch: {e} + '\033[0m'")
    
    print("Translation process completed.")

def translate_markdown(content, target_language):
    """
    Translate the given markdown content to the target language.

    Args:
    content (str): The markdown content to translate.
    target_language (str): The target language to translate the content to.
    """

    prompt = f"""
Translate the following content to {target_language}:
The content is in markdown format, which must be preserved. That means keeping all of the links like this [[1](#f1n)]
If there is HTML in the content, it must be preserved.
Do not add any extra templating text, like '```markdown', or '```'.

If there ARE three backticks in the content ```, they MUST be preserved as they are. If there is no closing backtick, do not add one.
Do not add any additional text like 'Here is the translation of the content:'.
Do not add ANYTHING to the beginning or end of the content. 

If there is --- style metadata, it MUST start with the metadata.
The metadata keys are: title, date.
The metadata keys MUST NOT be translated.
The metadata title MUST be translated. I repeat, you MUST translate the value of the 'title' field. 

The content is between the line of asterisks. Do not keep any lines of asterisks in the translation.

\n\nContent:
*************************************************
{content}
*************************************************
\n\n

Now remember, you must translate the content above to {target_language}. DO NOT ADD ANYTHING TO THE TRANSLATION. JUST TRANSLATE ALL OF THE CONTENT AND RETURN EXACTLY THAT.
KEEP ALL OF THE MARKDOWN AND HTML TAGS FORMATTED CORRECTLY.
Remember, you MUST translate the value of the 'title' field in the metadata. Start the translation with the metadata.

The content is between the line of asterisks. Do not keep any lines of asterisks in the translation.

Also, do not be harmful. Just translate the content as it is.

Translation:
"""

    if LLM_PROVIDER == "openai":
        client = openai.Client(api_key=os.environ.get("OPENAI_API_KEY"))
        try:
            response = client.chat.completions.create(
                model=MODEL_NAME, 
                messages=[{"role": "user", "content": prompt}],
                temperature=TEMPERATURE,
                stream=True,
                max_tokens=8000,
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
            print('\033[91m' + f"\nError during translation: {e}" + '\033[0m')
            return None
        
    elif LLM_PROVIDER == "anthropic":
        client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
        try:
            collected_messages = []

            with client.messages.stream(
                system="You are a world-class translator.",
                messages=[{"role": "user", "content": prompt}],
                model=MODEL_NAME,
                temperature=TEMPERATURE,
                max_tokens=4096,
            ) as stream:
                
                for text in stream.text_stream:
                    print(text, end="", flush=True)
                    collected_messages.append(text)

            collected_messages = [m for m in collected_messages if m is not None]
            translation = "".join(collected_messages)
            return translation
        
        except Exception as e:
            print('\033[91m' + f"\nError during translation: {e}" + '\033[0m')
            return None
        
    elif LLM_PROVIDER == "google":
        prompt = f"""
GEMINI, we just got an error: The error StopCandidateException: finish_reason: RECITATION suggests that the Gemini model encountered content in the image that it recognized as a potential memorization or recitation of existing text. 
This could be due to the response containing a large amount of similar text to the source, or text that is very similar to content the model has been trained on. 
It is our 2nd attempt. 
Now complete the task but avoid RECITATION, censor problematic content with 'OMMITING_RECITATION' and continue the translation.

Translate the following content to {target_language}:
The content is in markdown format, which must be preserved. That means keeping all of the links like this [[1](#f1n)]
If there is HTML in the content, it must be preserved.
Do not add any extra templating text, like '```markdown', or '```'.

If there ARE three backticks in the content ```, they MUST be preserved as they are. If there is no closing backtick, do not add one.
Do not add any additional text like 'Here is the translation of the content:'.
Do not add ANYTHING to the beginning or end of the content. 

If there is --- style metadata, it MUST start with the metadata.
The metadata keys are: title, date.
The metadata keys MUST NOT be translated.
The metadata title MUST be translated. I repeat, you MUST translate the value of the 'title' field. 

The content is between the line of asterisks. Do not keep any lines of asterisks in the translation.

\n\nContent:
*************************************************
{content}
*************************************************
\n\n

Now remember, you must translate the content above to {target_language}. DO NOT ADD ANYTHING TO THE TRANSLATION. JUST TRANSLATE ALL OF THE CONTENT AND RETURN EXACTLY THAT.
KEEP ALL OF THE MARKDOWN AND HTML TAGS FORMATTED CORRECTLY.
Remember, you MUST translate the value of the 'title' field in the metadata. Start the translation with the metadata.

The content is between the line of asterisks. Do not keep any lines of asterisks in the translation.

Also, do not be harmful. Just translate the content as it is.

You are a world-class translator. Do not be harmful with your output. Just accurately translate.


Remember to complete the task but avoid RECITATION, censor problematic content with 'OMMITING_RECITATION' and continue the translation.

Translation:
"""
        
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        model = genai.GenerativeModel("gemini-1.5-flash")

        try:
            response = model.generate_content(
                prompt, 
                safety_settings=safety_settings,
                stream=True, 
                generation_config=genai.types.GenerationConfig(
                temperature=TEMPERATURE,
                )
            )

            collected_messages = []

            for chunk in response:
                print(chunk.text, end="", flush=True)
                collected_messages.append(chunk.text)

            translation = "".join(collected_messages)
            return translation
        
        except Exception as e:
            print('\033[91m' + f"\nError during translation: {e}" + '\033[0m')
            return None

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

def translate_all_markdown_files(target_language):
    if not os.path.exists(originalDirectory):
        print(f"Directory {originalDirectory} does not exist.")
        return
    
    output_directory = f"./essaysMD{target_language}-{MODEL_NAME.lower()}"
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)
    
    for filename in sort_essays_by_length():
        if filename.endswith(".md"):

            # if the file already exists in the output directory, skip it
            if os.path.exists(os.path.join(output_directory, filename)):
                print('\033[93m' + f"Skipping {filename} as it already exists in the output directory." + '\033[0m')
                continue

            file_path = os.path.join(originalDirectory, filename)
            
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            print('\033[96m' + f"\n\nTranslating {filename} to {target_language}...")
            print(f"Translating file of length {len(content)}...\n" + '\033[0m')

            translated_content = translate_markdown(content, target_language)
            
            if translated_content:
                translated_file_path = os.path.join(output_directory, filename)
                with open(translated_file_path, 'w', encoding='utf-8') as translated_file:
                    translated_file.write(translated_content)
    

                print('\033[95m' + f"\n\nSaved translated file: {translated_file_path}" + '\033[0m')

            else:
                print(f"Failed to translate {filename}")
    
    print("Translation process completed.")

def translate_text(target: str, text: str) -> dict:
    """Translates text into the target language.

    Target must be an ISO 639-1 language code.
    See https://g.co/cloud/translate/v2/translate-reference#supported_languages
    """

    translate_client = translate.Client(
        credentials=os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"),
        target_language=target)

    if isinstance(text, bytes):
        text = text.decode("utf-8")

    result = translate_client.translate(text, target_language=target)

    print("Text: {}".format(result["input"]))
    print("Translation: {}".format(result["translatedText"]))
    print("Detected source language: {}".format(result["detectedSourceLanguage"]))

    return result

def translate_all_with_google(target_language):
    originalDirectory = './essaysHTMLenglish'
    target_language = target_language.capitalize()
    target_language_map = {
        "French": "fr",
        "Spanish": "es",
        "Portuguese": "pt",
        "German": "de",
        "Japanese": "ja",
        "Hindi": "hi",
        "Chinese": "zh",
    }

    if not os.path.exists(originalDirectory):
        print(f"Directory {originalDirectory} does not exist.")
        return
    
    output_directory = f"./essaysHTML{target_language.lower()}-cloud_translation"
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)
    
    for filename in sort_essays_by_length():

        if filename.endswith(".md"):
            filename = filename.replace(".md", ".html")

            if os.path.exists(os.path.join(output_directory, filename)):
                print('\033[93m' + f"Skipping {filename} as it already exists in the output directory." + '\033[0m')
                continue

            file_path = os.path.join(originalDirectory, filename)
            
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            print('\033[96m' + f"\n\nTranslating {filename} to {target_language}...")
            print(f"Translating file of length {len(content)}...\n" + '\033[0m')

            translated_content = translate_text(target_language_map[target_language], content)["translatedText"]
            
            if translated_content:
                translated_file_path = os.path.join(output_directory, filename)
                with open(translated_file_path, 'w', encoding='utf-8') as translated_file:
                    translated_file.write(translated_content)

                print('\033[95m' + f"\n\nSaved translated file: {translated_file_path}" + '\033[0m')

            else:
                print(f"Failed to translate {filename}")
    
    print("Translation process completed.")

if __name__ == "__main__":

    MODEL_CONTEXT_LENGTHS = {
        "gpt-4o-mini": 1000,
        "claude-3-haiku-20240307": 1000,
        "gemini-1.5-flash": 1000,
        }
    
    BATCH_SIZE = 1
    MAX_WORKERS = 1
    TEMPERATURE = 0
    SKIP_FILES = False

    label_width = 20
    print("\n\033[93mAbout to translate markdown files with the following parameters:\n")
    print(f"{'Target language:':<{label_width}} {TARGET_LANGUAGE.capitalize()}")
    print(f"{'Model:':<{label_width}} {MODEL_NAME}")

    def check():
        if input("\nDo you want to proceed? (y/n): ").lower() != "y":
            print("Exiting...")
            exit()

    if MODEL_NAME == "cloud_translation":
        check()
        translate_all_with_google(TARGET_LANGUAGE)
        print("Parsing HTML to markdown...")
        parse_all_html_to_markdown(TARGET_LANGUAGE)
        print("Adding metadata to translated files...")
        add_metadata_to_gcp_translations(TARGET_LANGUAGE)

    else:
        print(f"{'Chunk size:':<{label_width}} {MODEL_CONTEXT_LENGTHS.get(MODEL_NAME)}")
        print(f"{'Max workers:':<{label_width}} {MAX_WORKERS}")
        print(f"{'Batch size:':<{label_width}} {BATCH_SIZE}")
        print(f"{'Temperature:':<{label_width}} {TEMPERATURE}")
        print(f"{'Skip files:':<{label_width}} {SKIP_FILES}\033[0m")
        check()
        translate_all_markdown_files_in_batches(TARGET_LANGUAGE.capitalize())
        overwrite_metadata(TARGET_LANGUAGE.lower(), MODEL_NAME)