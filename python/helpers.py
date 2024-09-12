import os

def count_words(file_name):
    with open(f'./essaysMDenglish/{file_name}', 'r') as file:
        content = file.read()
    words = content.split()
    return len(words)

def shortest_100_essays():
    total_words = 0
    essayWordsMap = {}

    for filename in os.listdir('./essaysMDenglish'):
        if filename.endswith(".md"):
            words = count_words(filename)
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
            words = count_words(filename)
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

if __name__ == "__main__":
    count_translations()
