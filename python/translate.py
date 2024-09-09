import os
import openai

directory = './essaysMDenglish'
LLM_PROVIDER = "openai"
MODEL_NAME = "gpt-4o-mini"
TARGET_LANGUAGE = "French"

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

# Main function to process all markdown files in the directory
# TODO: Log errors to a file
def translate_all_markdown_files(target_language):
    if not os.path.exists(directory):
        print(f"Directory {directory} does not exist.")
        return
    
    output_directory = f"./essaysMD{target_language}"
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)
    
    for filename in os.listdir(directory):
        if filename.endswith(".md"):
            file_path = os.path.join(directory, filename)
            
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
    file_path = os.path.join(directory, file_name)
    
    with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()   

    print(f"Translating {file_path} to {target_language}...")
    translated_content = translate_markdown(content, target_language)

    if translated_content:
        translated_file_path = f"./essaysMD{target_language.lower()}/{file_name}"
        with open(translated_file_path, 'w', encoding='utf-8') as translated_file:
            translated_file.write(translated_content)
                
        print(f"\n\nSaved translated file: {translated_file_path}")
    else:
        print(f"\n\nFailed to translate {file_path}")

    print("Translation process completed.")


if __name__ == "__main__":
    translate_one_markdown_file(TARGET_LANGUAGE, "read.md")
    # translate_all_markdown_files(TARGET_LANGUAGE)