import os
import re
import sys
import tiktoken

model_map = {
    'gpt-4o-mini': 'gpt-4o-mini',
    'claude-3-haiku': 'claude-3-haiku-20240307',
    'gemini-1.5-flash': 'gemini-1.5-flash',
    'google-NMT': 'google-NMT',
    }

lang_threshold_map = {
    'portuguese': 1.2,
    'spanish': 1.2,
    'french':    1.2,
    'german':    1.15,
    'japanese':  0.7,
    'hindi':     1.15,
    'chinese':   0.7,
}

def pretty_print(data, indent=4, level=0):
            """
            Custom pretty print function for nested dictionaries.

            Args:
                data (dict): The data to print in a pretty format.
                indent (int): The number of spaces to use for indentation. Default is 4.
                level (int): The current level of depth in the nested structure.
            """
            spacing = ' ' * (indent * level + 2)
            
            if isinstance(data, dict):
                for key, value in data.items():
                    if isinstance(value, dict):
                        print(f"{spacing}{key}:")
                        pretty_print(value, indent, level + 1)
                    else:
                        if key == "ratio" and value > 1.5 or value < 0.5:
                            print(f"\033[91m{spacing}{key}: {value}\033[0m")
                        else:
                            print(f"{spacing}{key}: {value}")
            else:
                print(f"{spacing}{data}")      

            if level == 1:
                print("")

def delete_files(file_name, lang=None, model=None):
    """
    Delete files with the given file_name in all directories starting with 'essaysMD',
    except for the 'essaysMDenglish' directory.
    """
    delete_all = None  # Can be 'yes', 'no', or None

    for folder in os.listdir('.'):
        if folder.startswith('essaysMD') and folder != 'essaysMDenglish':
            if model and model not in folder:
                # print(f"Skipping {folder} since it does not contain the model {model}\n")
                continue
            if lang and lang not in folder:
                # print(f"Skipping {folder} since it does not contain the language {lang}\n")
                continue
            folder_path = os.path.join('.', folder)
            for filename in os.listdir(folder_path):
                if filename == file_name:
                    file_path = os.path.join(folder_path, filename)
                    print(f"\nFound {file_path}")
                    
                    if delete_all == 'yes':
                        os.remove(file_path)
                        print(f"Deleted {file_path}")
                    elif delete_all == 'no':
                        print(f"Skipped {file_path}")
                    else:
                        response = input("Are you sure you want to delete this file? (yes: y, no: n, yes to all: Y, no to all: N) ").strip()
                        if response == 'y':
                            os.remove(file_path)
                            print(f"Deleted {file_path}\n")
                        elif response == 'n':
                            print(f"Skipped {file_path}\n")
                        elif response == 'Y':
                            os.remove(file_path)
                            print(f"Deleted {file_path}\n")
                            delete_all = 'yes'
                        elif response == 'N':
                            print(f"Skipped {file_path}\n")
                            delete_all = 'no'
                        else:
                            print("Invalid input. Skipping this file.")

def count_words(file_name, lang, model=None):
    if lang == 'english':
        with open(f'./essaysMDenglish/{file_name}', 'r') as file:
            content = file.read()
    else:
        if os.path.exists(f'./essaysMD{lang}-{model}/{file_name}'):
            with open(f'./essaysMD{lang}-{model}/{file_name}', 'r') as file:
                content = file.read()
        else:
            print(f"\033[93m{file_name} does not exist in {lang} for {model}. Skipping...\033[0m\n")
            return

    words = content.split()
    return len(words)

def count_tokens(file_name, lang, model="gpt-4o-mini"):
    if lang == 'english':
        with open(f'./essaysMDenglish/{file_name}', 'r') as file:
            content = file.read()
    else:
        if os.path.exists(f'./essaysMD{lang}-{model}/{file_name}'):
            with open(f'./essaysMD{lang}-{model}/{file_name}', 'r') as file:
                content = file.read()
        else:
            print(f"\033[93m{file_name} does not exist in {lang} for {model}. Skipping...\033[0m\n")
            return


    if model.startswith("gpt-"):
        encoding = tiktoken.encoding_for_model(model)
    else:
        encoding = tiktoken.get_encoding("cl100k_base")

    tokens = encoding.encode(content)
    return len(tokens)

def count_all_words():
    total_words = 0

    for filename in os.listdir('./essaysMDenglish'):
        if filename.endswith(".md"):
            words = count_words(filename, "english")
            total_words += words

    print("\nTotal words in all files:", total_words)

def count_all_tokens():
    total_tokens = 0

    for filename in os.listdir('./essaysMDenglish'):
        if filename.endswith(".md"):
            tokens = count_tokens(filename, "english")
            total_tokens += tokens

    print("\nTotal tokens in all files:", total_tokens)

def shortest_100_essays():
    total_words = 0
    essayWordsMap = {}

    for filename in os.listdir('./essaysMDenglish'):
        if filename.endswith(".md"):
            words = count_words(filename, "english")
            total_words += words
            essayWordsMap[filename] = words

    print("Total words in all files:", total_words)

    # sort by number of words ascending
    sorted_essayWordsMap = dict(sorted(essayWordsMap.items(), key=lambda item: item[1]))

    # return the titles of the 100 shortest essays
    return list(sorted_essayWordsMap.keys())[:100]

def sort_essays_by_length():
    essayWordsMap = {}

    for filename in os.listdir('./essaysMDenglish'):
        if filename.endswith(".md"):
            words = count_words(filename, 'english')
            essayWordsMap[filename] = words

    # sort by number of words ascending
    sorted_essayWordsMap = dict(sorted(essayWordsMap.items(), key=lambda item: item[1]))

    return list(sorted_essayWordsMap.keys())

def count_translations(lang=None):
    print("Counting translations...\n")
    for folder in os.listdir('.'):
        if folder.startswith('essaysMD'):
            if lang and lang not in folder:
                continue
            count = 0
            for filename in os.listdir(folder):
                if filename.endswith(".md"):
                    count += 1
            if count < 223:
                print('\033[91m' + f"Number of translations in {folder}: {count}" + '\033[0m')
            else:
                print(f"Number of translations in {folder}: {count}")
            print("")

def find_lang_delta(lang, model, threshold):
    original = list(sort_essays_by_length())
    delta = {}
    model = model_map[model]

    for original_essay in original:
        original_count = count_words(original_essay, 'english')
        translated_count = count_words(original_essay, lang, model)

        if not translated_count:
            continue

        delta[original_essay] = {"original_count": original_count, "translated_count": translated_count, "delta": translated_count - original_count, "ratio": translated_count/original_count}

        if (threshold >= 1 and translated_count/original_count > threshold) or (threshold < 1 and translated_count/original_count < threshold):
            print("\nEssay:", original_essay, "\nDelta:", delta[original_essay]["delta"])
            print("Original Count:", original_count, "\nTranslated Count:", translated_count)
            print("\033[91m" + f"Translated essay does not meet the {(threshold*100):.0f}% threshold" + "\033[0m")

    return {k: v for k, v in delta.items() if (threshold >= 1 and v["ratio"] > threshold) or (threshold < 1 and v["ratio"] < threshold) or v["ratio"] > 1.5 or v["ratio"] < 0.5}

def find_model_delta(lang, threshold):
    """
    Finds the delta between the different model's translations for a given language and essay. 
    """

    original = list(sort_essays_by_length())
    delta = {}

    for original_essay in original:
        original_count = count_words(original_essay, 'english')
        for model in model_map.values():
            translated_count = count_words(original_essay, lang, model)

            if not translated_count:
                continue

            if original_essay not in delta:
                delta[original_essay] = {}

            delta[original_essay][model] = translated_count


        # if original_essay does not exist in any model, skip it
        if not any(original_essay in d for d in delta.keys()):
            print(f"\033[93m{original_essay} does not exist in {lang} for any model. Skipping...\033[0m\n")
            continue

        maximum = max(delta[original_essay].values())
        minimum = min(delta[original_essay].values())
        ratio = maximum/minimum

        # if minimum != delta[original_essay]["gemini-1.5-flash"]:
        #     print("Skipping as gemini-1.5-flash is not the model with the minimum word count")
        #     continue

        if (ratio > 1+threshold) and original_count > 300:
            print('\033[91m' + f"\nEssay {original_essay} does not meet the 5% threshold" + '\033[0m')
            label_width =10
            if ratio > 1.5:
                print('\033[96m' + f"{"Ratio:":<{label_width}}", ratio)
                print('\033[0m', end="")
            else:
                print(f"{"Ratio:":<{label_width}}", ratio)
            print(f"{"Delta:":<{label_width}}", maximum - minimum)
            print(f"{"\nMaximum:":<{label_width}}", maximum)
            print(f"{"Minimum:":<{label_width}}", minimum)
            print("Essay")
            pretty_print(delta[original_essay])
            print(f"{'Original Count:':<{label_width}} {original_count}")

            if ratio > 10 and minimum < 100:
                continue
            # find the model with the minimum word count
            min_model = min(delta[original_essay], key=delta[original_essay].get)

            delete_files(original_essay, lang=lang, model=min_model)


    return delta

def copy_metadata_and_notice(lang, model):
    with open("error.log", "r") as f:
        failed_files = f.read().splitlines()

    for file in failed_files:
        if (model not in file or lang not in file):
            continue
        file_name = file.split("-")[0]

        if os.path.exists(f'./essaysMD{lang}-{model}/{file_name}'):
            print(f"{file_name} already exists in {lang} for {model}. Skipping...")
            continue

        if input(f"Copy metadata and notice to {file_name} in {lang} for {model}? (yes: y, no: n) ").strip() != 'y':
            continue

        with open(f'./essaysMD{lang}-gpt-4o-mini/{file_name}', 'r') as file:
            content = file.read()
            metadata = content.split('---')[1]
            print("Metadata:", metadata)
        with open(f'./essaysMD{lang}-{model}/{file_name}', 'w') as new_file:
            new_file.write(f'---{metadata}---\n')
            new_file.write(f"It wasn't possible to translate this essay with {model}.\nPlease try again with a different model.\n")
            print(f"Metadata and notice copied to {file_name}")

def flag_asterisks(lang, model):
    # reads all files in the essaysMD folder for the given language and model
    # logs the filenames of files that contain single strings with more than 3 asterisks
    model = model_map[model]
    threshold = 3
    asterisk_files = []

    print('\033[34m' + "\nLang:", lang)
    print("Model:", model, "\n\033[0m")

    for filename in os.listdir(f'./essaysMD{lang}-{model}'):
        if filename.endswith(".md"):
            with open(f'./essaysMD{lang}-{model}/{filename}', 'r') as file:
                content = file.read()
            # use regex to find strings with more than 3 consecutive asterisks
            asterisk_match = re.search(r'\*{4,}', content)
            if asterisk_match:
                asterisk_files.append(filename)
                print(f"./essaysMD{lang}-{model}/{filename} contains more than {threshold} consecutive asterisks")

    if not len(asterisk_files):
        print('\033[92m' + "No files contain more than 3 consecutive asterisks" + '\033[0m')

    else:
        print(f"\n{len(asterisk_files)} files contain more than {threshold} consecutive asterisks")
        # for file in asterisk_files:
        #     delete_files(file, lang=lang, model=model)

def flag_metadata(lang, model):
    model = model_map[model]
    duplicate_metadata_files = []

    for filename in os.listdir(f'./essaysMD{lang}-{model}'):
        if filename.endswith(".md"):
            with open(f'./essaysMD{lang}-{model}/{filename}', 'r') as file:
                content = file.read()

            metadata_match = re.findall(r'title:', content)
            if len(metadata_match) > 2:
                duplicate_metadata_files.append(filename)
                print(f"./essaysMD{lang}-{model}/{filename} contains duplicate metadata")
        
    if not len(duplicate_metadata_files):
        print('\033[92m' + "No files contain duplicate metadata" + '\033[0m')
    else:
        print(f"\n{len(duplicate_metadata_files)} files contain duplicate metadata")
        # for file in duplicate_metadata_files:
        #     delete_files(file, lang=lang, model=model)

if __name__ == "__main__":
    if len(sys.argv) > 2:
        if sys.argv[1] == 'delete':
            file = sys.argv[2] + '.md'

            if len(sys.argv) > 3:
                model = None
                lang = None

                if sys.argv[3] in model_map.keys():
                    model = model_map[sys.argv[3]]
                else:
                    lang = sys.argv[3]

                if len(sys.argv) > 4:
                    if sys.argv[4] in model_map.keys():
                        model = model_map[sys.argv[4]]
                    else:
                        lang = sys.argv[4]

                delete_files(file, model=model, lang=lang)

            else:
                delete_files(file)

        elif sys.argv[1] == 'count':
            lang = sys.argv[2]
            count_translations(lang=lang)

        elif sys.argv[1] == "copy":
            lang = sys.argv[2]
            copy_metadata_and_notice(lang, model="claude-3-haiku")

    elif len(sys.argv) == 2:
        lang = 'chinese'
        model = 'gpt-4o-mini'

        if sys.argv[1] == 'count':
            count_translations()

        if sys.argv[1] == 'langdelta':
            threshold = lang_threshold_map[lang]
            print(f"\n\033[95mFinding essays translated by {model} into {lang} that require review...\033[0m")
            delta = find_lang_delta(lang, model, threshold)
            if len(delta):
                print(f"\n\033[95mEssays that do not meet the {(threshold*100):.0f}% threshold\033[0m")
                pretty_print(delta)
            else:
                print('\033[92m'+ f"\nAll essays meet the {(threshold*100):.0f}% threshold\n" + '\033[0m')   

        elif sys.argv[1] == 'modeldelta':
            threshold = 0.05
            print(f"\n\033[95mFinding essays translated by different models into {lang} that require review...\033[0m")
            delta = find_model_delta(lang, threshold)

        elif sys.argv[1] == "copy":
            copy_metadata_and_notice(lang, model=model_map[model])

        elif sys.argv[1] == "flag":
            for model in model_map.keys():
                flag_asterisks(lang, model)
                flag_metadata(lang, model)
                print("")

        elif sys.argv[1] == "countall":
            count_all_words()

        elif sys.argv[1] == "tokens":
            count_all_tokens()