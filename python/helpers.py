import os
import sys

model_map = {
    'gpt-4o-mini': 'gpt-4o-mini',
    'claude-3-haiku': 'claude-3-haiku-20240307'
    }

def pretty_print(data, indent=4, level=0):
            """
            Custom pretty print function for nested dictionaries.

            Args:
                data (dict): The data to print in a pretty format.
                indent (int): The number of spaces to use for indentation. Default is 4.
                level (int): The current level of depth in the nested structure.
            """
            spacing = ' ' * (indent * level)
            
            if isinstance(data, dict):
                for key, value in data.items():
                    if isinstance(value, dict):
                        print(f"{spacing}{key}:")
                        pretty_print(value, indent, level + 1)
                    else:
                        print(f"{spacing}{key}: {value}")
            else:
                print(f"{spacing}{data}")      

def delete_files(file_name, model=None):
    """
    Delete files with the given file_name in all directories starting with 'essaysMD',
    except for the 'essaysMDenglish' directory.
    """
    delete_all = None  # Can be 'yes', 'no', or None

    if model:
        model = model_map[model]

    for folder in os.listdir('.'):
        if folder.startswith('essaysMD') and folder != 'essaysMDenglish':
            if model and model not in folder:
                print(f"Skipping {folder} since it does not contain the model {model}")
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
                            print(f"Deleted {file_path}")
                        elif response == 'n':
                            print(f"Skipped {file_path}")
                        elif response == 'Y':
                            os.remove(file_path)
                            print(f"Deleted {file_path}")
                            delete_all = 'yes'
                        elif response == 'N':
                            print(f"Skipped {file_path}")
                            delete_all = 'no'
                        else:
                            print("Invalid input. Skipping this file.")

def count_words(file_name, lang, model=None):
    if lang == 'english':
        with open(f'./essaysMDenglish/{file_name}', 'r') as file:
            content = file.read()
    else:
        with open(f'./essaysMD{lang}-{model}/{file_name}', 'r') as file:
            content = file.read()

    words = content.split()
    return len(words)

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

    return sorted_essayWordsMap.keys()

def count_translations():
    for folder in os.listdir('.'):
        if folder.startswith('essaysMD'):
            print(folder)
            count = 0
            for filename in os.listdir(folder):
                if filename.endswith(".md"):
                    count += 1
            print("Number of translations:", str(count) + "\n")

def find_delta(lang, model):
    original = list(sort_essays_by_length())
    delta = {}
    THRESHOLD = 0.15
    model = model_map[model]

    for i in range(len(original)):
        original_essay = (original)[i]
        original_count = count_words(original_essay, 'english')
        translated_count = count_words(original_essay, lang, model)
        delta[original_essay] = {"delta": translated_count - original_count, 
                                 "original_count": original_count,}

        if abs(delta[original_essay]["delta"]/original_count) > THRESHOLD: 
            print("\nEssay:", original_essay, "\nDelta:", delta[original_essay]["delta"])
            print("Original Count:", original_count, "\nTranslated Count:", translated_count)
            print("\033[91m" + f"Translated essay does not meet the {THRESHOLD*100}% threshold" + "\033[0m")

    # # return the essays that do not meet the threshold, and where the delta is lower than -100
    # delta = {k: v for k, v in delta.items() if abs(v)/count_words(k, 'english') > THRESHOLD and v < -100}

    # return the essays that do not meet the threshold, and where the number of words is greater than 1000
    delta = {k: v for k, v in delta.items() if abs(v["delta"])/count_words(k, 'english') > THRESHOLD and count_words(k, 'english') > 1000}

    return delta

if __name__ == "__main__":
    lang = 'german'
    # model = "claude-3-haiku"
    model = "gpt-4o-mini"

    count_translations()

    if len(sys.argv) > 2:
        if sys.argv[1] == 'delete':
            file = sys.argv[2] + '.md'

            print(len(sys.argv))
            if len(sys.argv) > 3:
                delete_files(file, sys.argv[3])

            else:
                delete_files(file)

    else:
        delta = find_delta(lang, model)
        print("\nEssays that do not meet the 15% threshold")
        if len(delta):
            pretty_print(delta)
        else:
            print('\033[92m'+ "All essays meet the 15% threshold\n" + '\033[0m')      

    # #     # for each essay in delta, delete the translated file from all folders starting with essaysMD, containing the model
    # #     for essay in delta:
    # #         delete_files(essay, model)
    # #         print(f"Deleted {essay} from all folders starting with 'essaysMD' containing the model {model}")