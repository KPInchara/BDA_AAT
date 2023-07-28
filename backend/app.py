from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import os
import pandas as pd
import requests
import json
from bson import json_util

#Connect to MongoDB
def connect_to_mongodb():
    try:
        client = MongoClient('mongodb+srv://LAVA:Lava7259@cluster0.ltqx9vy.mongodb.net/?retryWrites=true&w=majority/',w='majority')
        db = client['test']
        return db
    except MongoClient.errors.ConnectionFailure as e:
        print(f"Connection error: {e}")
        return None

db_connection = connect_to_mongodb()
if db_connection is not None:
    print("Connected to MongoDB successfully!")
    collection = db_connection ['Kannada']
else:
    print("Failed to connect to MongoDB.")

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = r'C:\Users\lavak\Documents\MTech\sem-2\BDT\AAT\backend\upload'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

#ROUTES
@app.route('/', methods=['GET'])
def get_data():
    return jsonify("hi")


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'No file part', 400

    file = request.files['file']

    if file.filename == '':
        return 'No selected file', 400

    if file:
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
        # Save the new .csv file, overwriting the old one if it exists
        #file.save(os.path.join(UPLOAD_FOLDER, 'data.csv'))
        
        # Read the CSV data using pandas
        path =os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        # Replace 'data.csv' with the path to your CSV file
        data = pd.read_csv(path)

        # Convert the data to a list of dictionaries for MongoDB insertion
        data_list = data.to_dict(orient='records')
        result = collection.insert_many(data_list)
        return jsonify({"data":"uploaded to database"}), 200
    else:
        return 'File upload failed', 500

selected_option = None
@app.route('/import', methods=['GET', 'POST'])
def download_file():
    global selected_option
    if request.method == 'POST':
        data = request.get_json()
        selected_option = data['selected_option']
        
        collection = db_connection [selected_option]
        data = collection.find()
        
        # Export the data to a JSON file
        with open('exported_data.json', 'w') as file:
            for document in data:
                # Convert ObjectId to JSON-serializable format
                document_json = json.loads(json_util.dumps(document))
                json.dump(document_json, file)
                file.write('\n')
        return jsonify({'message': 'Option successfully set'}), 200
    # elif request.method == 'GET':
    #     return jsonify({'selected_option': selected_option}), 200
    else:
        return jsonify({'error': 'Invalid request method'}), 400
    


















if __name__ == '__main__':    
    app.run(debug=True)