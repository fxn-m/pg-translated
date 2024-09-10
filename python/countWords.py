# file_name = "greatwork.md"

import os

def count_words(file_name):
    with open(f'./essaysMDenglish/{file_name}', 'r') as file:
        content = file.read()
    words = content.split()
    # print(f"{file_name} has {len(words)} words.")
    return len(words)

def shortest_100_essays():
    total_words = 0
    essayWordsMap = {}

    for i, filename in enumerate(os.listdir('./essaysMDenglish')):
        if filename.endswith(".md"):
            # print(i, end=" ", flush=True)
            words = count_words(filename)
            total_words += words
            essayWordsMap[filename] = words

    print("\n\nTotal words in all files:", total_words)

    # sort by number of words ascending
    sorted_essayWordsMap = dict(sorted(essayWordsMap.items(), key=lambda item: item[1]))

    # return the titles of the 100 shortest essays
    return list(sorted_essayWordsMap.keys())[:100]

# if __name__ == "__main__":
#     shortest_100_essays()