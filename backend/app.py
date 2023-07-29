from flask import Flask, jsonify, request,send_file
from flask_cors import CORS
from pymongo import MongoClient
import os
import pandas as pd
import requests
import json
from bson import json_util

#Connect to MongoDB
client=None
def connect_to_mongodb():
    try:
        global client
        client = MongoClient('mongodb+srv://LAVA:Lava7259@cluster0.ltqx9vy.mongodb.net/?retryWrites=true&w=majority/',w='majority')
        db = client['BDA']
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

#getting all collection names
def get_all_collections(database_name):
    db_connection = client[database_name]
    collections_list = db_connection.list_collection_names()
    return collections_list
 
#getting database names
def get_all_databases():
    database_names = client.list_database_names()    
    return database_names

app = Flask(__name__)
CORS(app)

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
        # Save the file to a specific folder
        folder_path = r'C:\Users\lavak\Documents\MTech\sem-2\BDA_AAT\backend\upload'
        file_path=os.path.join(folder_path, file.filename)
        file.save(file_path)
        # Read the CSV data using pandas
        data = pd.read_csv(file_path)

        # Convert the data to a list of dictionaries for MongoDB insertion
        data_list = data.to_dict(orient='records')
        
        # db_connection.create_collection( os.path.splitext(file.filename)[0])
        # new_collection=db_connection[ os.path.splitext(file.filename)[0]]
        # result = new_collection.insert_many(data_list)    
        try:
            existing_collections = get_all_collections("BDA")
            if os.path.splitext(file.filename)[0] in existing_collections:
                new_collection=db_connection[ os.path.splitext(file.filename)[0]]
                result = new_collection.insert_many(data_list)
                #os.remove(file_path)        
                return jsonify({"data":f"uploaded to database for existing'{os.path.splitext(file.filename)[0]}' collection"}), 200
            else:
                db_connection.create_collection( os.path.splitext(file.filename)[0])
                new_collection=db_connection[ os.path.splitext(file.filename)[0]]
                result = new_collection.insert_many(data_list)
                #os.remove(file_path)        
                return jsonify({"data":f"uploaded to database for '{os.path.splitext(file.filename)[0]}' collection"}), 200
        except Exception as e:
            return "upload failed"
    else:
        return 'File upload failed', 500

selected_option = None
@app.route('/import', methods=['GET', 'POST'])
def download_file():
    global selected_option
    if request.method == 'POST':
        data = request.get_json()
        db_name= data['db_name']
        collection_name = data['collection_name']
        
        db = client[db_name]
        collection = db [collection_name]
        data = collection.find()
        
        # Export the data to a JSON file
        file_path=r'C:\Users\lavak\Documents\MTech\sem-2\BDA_AAT\backend\import\exported_data.json'
        with open(file_path, 'w') as file:
            for document in data:
                # Convert ObjectId to JSON-serializable format
                document_json = json.loads(json_util.dumps(document))
                json.dump(document_json, file)
                file.write('\n')
        return send_file(file_path, as_attachment=True),200
    # elif request.method == 'GET':
    #     return jsonify({'collection_name':collection_name}), 200
    else:
        return jsonify({'error': 'Invalid request method'}), 400
    
@app.route('/databaseNames', methods=['GET'])
def get_lists():
    databaseNames= get_all_databases()
    return jsonify({"databaseNames":databaseNames}),200

@app.route('/get_collections', methods=['GET'])
def get_collections():
    database_name = request.args.get('db')
    if database_name is None:
        return jsonify({'message': 'Database name parameter is missing'}), 400
    get_collections=get_all_collections(database_name)
    return jsonify({'collections': get_collections}),200

@app.route("/delete_collections",methods=["DELETE"])
def delete_collection():
    database_name = request.args.get('db')
    collection_name = request.args.get('collection')
    try:
        set_db=client[database_name]
        set_db.drop_collection(collection_name)
        return "deleted",200
    except Exception as e:
       return "failed to delete",400
    















if __name__ == '__main__':    
    app.run(debug=True)