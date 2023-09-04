# coding=utf-8
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import re
import nltk
import string
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.linear_model import LinearRegression
from sklearn.metrics import accuracy_score,precision_score,recall_score, confusion_matrix, classification_report


df = pd.read_csv(r"C:\Users\91761\Documents\Mtech\SEM-2\BDA_AAT\backend\Kannada_Senetences_Label.csv",header=None,names=["text","type"])
df["value"]=df['type'].map({"EMOTION":1,"NOEMOTION":-1})
df=df.dropna(axis=0)
#df.head()

df['text']=df['text'].astype('string')
df['type']=df['type'].interpolate()
df['text']=df['text'].astype('string')

#value counts of emotions
df['type'].value_counts()

# Define the preprocessing function
def preprocess_text(text):
    # remove punctuations and special characters
    #text = re.sub(r'[^\w\s]', '', text)
    text=text.lower()
    # initializing punctuations,special chacrters A-Z,1-0 string
    punc = '''!()-[]{};:'"\,<>./?@#$%^&*_~abcdefghijklmnopqrstuvwxyz1234567890'''
    
    for ele in text:
        if ele in punc:
            text = text.replace(ele, "")
    
    text = re.sub(r'\s+', ' ', text).strip()
    # remove stop words manually
    #s_words=set()
    #stop_words = ["ನನ್ನ","ಅದು", "ಅವನು", "ಅವರು", "ಆಗಿದೆ", "ಆಗಿದ್ದು","ನಾನು","ಇದು", "ಇವರು", "ಈ", "ಈಗ", "ಈಗಿನ", "ಉಂಟು", "ಉದ್ದೇಶಿಸಿದ್ದೇನಿದು", "ಉದ್ದೇಶಿಸಿದೇನೆ", "ಉದ್ದೇಶಿಸಿದ್ದೇನೆ", "ಉದ್ದೇಶ್ಯದಿಂದ", 			"ಉದ್ದೇಶ್ಯವನ್ನು", "ಉದ್ದೇಶ್ಯವಾಗಿ", "ಉದ್ದೇಶ್ಯವಿದೆ", "ಉದ್ದೇಶ್ಯವು", "ಉಪಯೋಗಿಸಲಾಗಿದೆ", "ಉಪಯೋಗಿಸಲಾಗುತ್ತದೆ", "ಉಪಯೋಗಿಸಲು", "ಉಪಯೋಗಿಸಿ", "ಉಪಯೋಗಿಸುವ", "ಉಪಯೋಗಿಸುವುದು", 	"ಉಪಯೋಗಿಸುವೆವು", "ಉಪಯೋಗಿಸುವುದೇನೆ", "ಉಪಯೋಗಿಸುವುದೇವೆ", "ಉಪಯೋಗಿಸು","ನಾನೇಗೆ"]

    words = text.split()
    filtered_words = [word for word in words ]
    return " ".join(filtered_words)


df['text'] = df['text'].apply(preprocess_text)

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(df['text'], df['type'], test_size=0.2, random_state=10)

# Create a bag-of-words representation of the text data
vectorizer = CountVectorizer()
X_train = vectorizer.fit_transform(X_train)
X_test = vectorizer.transform(X_test)

# Train the Naive Bayes algorithm
nb = MultinomialNB()
nb.fit(X_train, y_train)

# Evaluate the algorithm's performance
y_pred = nb.predict(X_test)
# print('Accuracy:', accuracy_score(y_test, y_pred))
# print('Confusion matrix:\n', confusion_matrix(y_test, y_pred))
# print('Classification report:\n', classification_report(y_test, y_pred))



def prosody_output(text):
    print(text)
    new_text=preprocess_text(text)    
    new_text = vectorizer.transform([new_text])
    y_pred = nb.predict(new_text)
    print(y_pred)
    return y_pred[0]