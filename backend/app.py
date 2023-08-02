from flask import Flask, jsonify, request,send_file,Response
from flask_cors import CORS
from pymongo import MongoClient
import os
import pandas as pd
import requests
import json
from bson import json_util
import base64
from io import BytesIO
from prosody import prosody_output
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
        database_name = request.args.get('db')

        # db_connection.create_collection( os.path.splitext(file.filename)[0])
        # new_collection=db_connection[ os.path.splitext(file.filename)[0]]
        # result = new_collection.insert_many(data_list)    
        try:
            existing_collections = get_all_collections(database_name)
            print(existing_collections)
            use_db=client[database_name]
            if os.path.splitext(file.filename)[0] in existing_collections:               
                new_collection=use_db[ os.path.splitext(file.filename)[0]]
                result = new_collection.insert_many(data_list)
                #os.remove(file_path)        
                return jsonify({"data":f"uploaded to database for existing'{os.path.splitext(file.filename)[0]}' collection"}), 200
            else:
                use_db.create_collection( os.path.splitext(file.filename)[0])
                new_collection=use_db[ os.path.splitext(file.filename)[0]]
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
    filtered_databaseNames = [item for item in databaseNames if item not in ['admin', 'local','users']]
    return jsonify({"databaseNames":filtered_databaseNames}),200

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
    
@app.route('/createDB', methods=['POST'])
def create_db():
    database_name = request.args.get('db')
    collection_name=request.args.get("collection")
    try:
        #new_db=client[database_name]
        existing_dbs=get_all_databases()
        
        #use_db=client[database_name]
        if database_name in existing_dbs:
            return "Database Alerdy Exist",200
        else:
            new_db=client[database_name]
            #new_collection=new_db.create_collection(collection_name)
            use_collection=new_db[collection_name]
            # Insert dummy data into the collection
            data = {"name": "nimhans", "email": "nimhans@gmail.com"}
            inserted_id =use_collection.insert_one(data).inserted_id
            return f"Created {collection_name} collection in {database_name} database",200
    except Exception as e:
        print(e)
        return "Failed to create database",400

@app.route("/delete_database",methods=["DELETE"])
def delete_database():
    database_name = request.args.get('db')
    try:
        client.drop_database(database_name)
        return f"{database_name} deleted succesfully",200
    except Exception as e:
        print(e)
        return "failed to delete",400

#USER OPERATIONS note to store user data we use users database and collection name is users_data
@app.route("/createUser",methods=["POST"])
def create_user():
    user_database=client["users"]
    collection_name=user_database["users_data"] 
    
    if not request.form.get('username') or not request.form.get('email') or not request.form.get('password'):
        return jsonify({'error': 'All fields (username, email, password) are required.'}), 400
    
    isUser=collection_name.find_one({'email': request.form.get('email')})
    if(isUser):
        return jsonify({'error': f'User already Registered with {request.form.get("email")}.'}), 409    
    image_data = request.files['image'].read()
    encoded_image = base64.b64encode(image_data).decode() 
    user_info={**request.form.to_dict(), "image":encoded_image }
    try:
        user_id=collection_name.insert_one(user_info).inserted_id
        if(user_id):
            user_data=get_user_info(request.form.get('email'))
            return user_data, 201
    except Exception as e:
        print(e)
        return "failed to create",400

def get_user_info(useremail):
    user_database=client["users"]
    collection_name=user_database["users_data"] 
    try:
        user = collection_name.find_one({'email': useremail})
        if user and "image" in user:
            user.pop('_id', None)
            user.pop("image",None)
            return user
        else:
            return jsonify({'error': 'User not found.'}), 404
    except Exception as e:
        print(e)
        return "failed to get data",400

@app.route("/getUser",methods=["GET"])
def get_user():
    try:
        return get_user_info(request.args.get('useremail')),200
    except Exception as e:
        return "Failed to fetch user data",400
    

@app.route("/getImage",methods=["GET"])
def get_image():
    user_database=client["users"]
    collection_name=user_database["users_data"] 
    try:
        user = collection_name.find_one({'email': request.args.get('useremail')})
        if user and "image" in user:
            decoded_image = base64.b64decode(user["image"])
            return send_file(BytesIO(decoded_image), mimetype='image/jpeg'),200
    except Exception as e:
        return "failed to get user image",400
#prosody call
@app.route("/predictSentence",methods=["POST"])
def send_prosody_output():
    text=request.form.get("key")
    try:
        user_database=client["users"]
        dataset_collection=user_database["Kannada_Senetences_Label"] 
        dataset = dataset_collection.find()
        df = pd.DataFrame(dataset)
        csv_file_path = os.path.join(r"C:\Users\lavak\Documents\MTech\sem-2\BDA_AAT\backend", 'New_Kannada_Senetences_Label.csv')
        df.to_csv(csv_file_path, index=False)
        print("saved")
        result=prosody_output(text)
        return jsonify({"type":result}),200
    except Exception as e:
        return "failed to detect",400

@app.route("/getCounts",methods=["GET"])
def get_prosody_count():
    user_database=client["users"]
    dataset_collection=user_database["Kannada_Senetences_Label"] 
    text_field = {"text": {"$exists": True, "$ne": ""}}
 
    # Count the number of documents with the specified text field
    try:
        text_count = dataset_collection.count_documents(text_field)
        emotion_count=dataset_collection.count_documents({"type":"EMOTION"})
        noemotion_count=dataset_collection.count_documents({"type":"NOEMOTION"}) 
        return jsonify({"emotion_count":emotion_count,"noemotion_count":noemotion_count,"text_count":text_count}),200
    except Exception as e:
        return "Failed to get prosody data",400
    
if __name__ == '__main__':    
    app.run(debug=True)