import React, { useState, useEffect, useCallback } from "react"
import axios from "axios"
import './Home.css';
import Navbar from "../../components/Navbar/Navbar.jsx";
import { useDropzone } from 'react-dropzone'
import { BsFiletypeCsv, BsFillDatabaseFill } from 'react-icons/bs'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
function Home() {
    const [databases, setDatabases] = useState([]);
    const [currentDB, setcurrentDB] = useState(null)
    const [collections, setcollections] = useState([])
    const [selectedFile, setselectedFile] = useState(null)
    const [seletedFileName, setseletedFileName] = useState(null)
    const [userSelectedDB, setuserSelectedDB] = useState(null)
    const [loading, setloading] = useState(false)
    const [createDBName, setcreateDBName] = useState(null)
    const [createCollection, setcreateCollection] = useState(null)
    const [uploading, setuploading] = useState(false)
    useEffect(() => {
        fetchDataBaseNames();
    }, []);
    const notify = (type, msg) => {
        if (type === 'success') {
            toast.success(msg, {
                position: "bottom-center"
            })
        }
        if (type === "error") {
            toast.error(msg, {
                position: "bottom-center"
            })
        }
        if (type === "info") {
            toast.info(msg, {
                position: "bottom-center"
            })
        }
    };
    const fetchDataBaseNames = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/databaseNames');
            setDatabases(response.data.databaseNames)
        } catch (error) {
            console.error('Error fetching data:', error);
            notify("error", "Unable to load database names")
        }
    };
    const handelDownload = async (e) => {
        try {
            const data = {
                "collection_name": e.target.id,
                "db_name": currentDB
            }
            const response = await axios.post("http://127.0.0.1:5000/import", data,
                {
                    responseType: 'blob',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            if (response.status === 200) {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                const collection_name = e.target.id + ".json"
                console.log(collection_name);
                link.setAttribute('download', collection_name);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.log(error);
        }
    }
    const handelDelete = async (e) => {
        console.log(currentDB, e.target.id);
        try {
            const response = await axios.delete(`http://127.0.0.1:5000/delete_collections?db=${currentDB}&collection=${e.target.id}`)
            console.log(response.data);
            if (response.status === 200) {
                notify("success", `${e.target.id} Deleted from ${currentDB} Database`)
                window.location.href = "/"
            }
        } catch (error) {
            console.log(error);
        }
    }
    const onDrop = useCallback(acceptedFile => {
        if (acceptedFile[0].type !== "text/csv") return notify("info", "Only CSV files are allowed")
        setselectedFile(acceptedFile[0])
        setseletedFileName(acceptedFile[0].path)
    }, [])
    //console.log(process.env.REACT_APP_BASE_URL);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
    const handelUploadFile = async () => {
        if (userSelectedDB === null) {
            notify("info", "Please select the database")
            return
        }
        setuploading(true)
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            const response = await axios.post(`http://127.0.0.1:5000/upload?db=${userSelectedDB}`, formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
            if (response.status === 200) {
                notify("success", `${seletedFileName} Uploaded Sucessfully`)
                setselectedFile(null)
                setseletedFileName(null)
                setuploading(false)
            }
        } catch (error) {
            console.log(error);
            notify("error", `${seletedFileName} Failed to Upload`)
            setselectedFile(null)
            setseletedFileName(null)
            setuploading(false)
        }
    }
    const handelViewModal = async (e) => {
        setcurrentDB(e.target.id)
        setloading(true)
        try {
            setcollections(null)
            const response = await axios.get(`http://127.0.0.1:5000/get_collections?db=${e.target.id}`);
            setcollections(response.data.collections);
            setloading(false)
        } catch (error) {
            console.error('Error fetching data:', error);
            setloading(false)
            notify("error", "Error fetching collections")
        }
    }
    const handelUserSelectedDB = (e) => {
        setuserSelectedDB(e.target.value)
    }
    const handelCreateDB = async () => {
        try {
            if (createDBName === null) return notify("info", "Please Enter Valid database name")
            if (createCollection === null) return notify("info", "Please Enter Valid collection name")
            const response = await axios.post(`http://127.0.0.1:5000/createDB?db=${createDBName.split(" ")[0]}&collection=${createCollection}`)
            if (response.status === 200) {
                notify('success', response.data)
                document.querySelector("#createdb").value = ""
                document.querySelector("#createCollection").value = ""
                setcreateCollection(null)
                setcreateDBName(null)
                fetchDataBaseNames()
            }
        } catch (error) {
            console.log(error);
            setcreateCollection("")
            setcreateDBName("")
            document.querySelector("#createdb").value = ""
            document.querySelector("#createCollection").value = ""
            notify("error", "failed to create database,try again")
        }
    }
    const handelDeleteDB = async (e) => {
        try {
            const response = await axios.delete(`http://127.0.0.1:5000/delete_database?db=${e.target.id}`)
            if (response.status === 200) {
                notify("success", response.data)
                fetchDataBaseNames()
                window.location.href = "/"
            }
        } catch (error) {
            console.log(error);
            notify("error", `Failed to delete ${e.target.id} database`)
        }
    }
    return (
        <div className="home">
            <Navbar />
            <div className="home-container-bg"></div>
            <div className="home-container-main">
                <section className="home-container-main-left">
                    <h1 className="m-2 p-2">Import File</h1>
                    <div className="db-form">
                        <input type="text" id="createdb" value={createDBName} onChange={(e) => setcreateDBName(e.target.value)} placeholder="Enter Database Name" />
                        <input type="text" id="createCollection" value={createCollection} onChange={(e) => setcreateCollection(e.target.value)} placeholder="Enter Collection Name" />
                        <button type="button" onClick={handelCreateDB} class="btn btn-secondary">Create Database</button>
                    </div>
                    <div className="collections">
                        <ul>
                            {databases.map((database, id) => (
                                <div key={id} className="database-name">
                                    <li><BsFillDatabaseFill />{database}</li>
                                    <button type="button" onClick={handelViewModal} id={database} className="btn btn-success" data-toggle="modal" data-target="#exampleModalCenter">View Collections</button>
                                </div>
                            ))}
                        </ul>
                    </div>
                    <div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="exampleModalLongTitle">{currentDB}</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    {loading ?
                                        <Stack sx={{ color: 'grey.500' }} spacing={2} direction="row">
                                            <CircularProgress color="success" /><span>Loading.....</span>
                                        </Stack>
                                        :
                                        <>
                                            {collections && collections.map((collection, id) => (
                                                <div className="collections-tag" key={id}>
                                                    <li >{collection}</li>
                                                    <div>
                                                        <button id={collection} onClick={handelDelete} className="btn btn-danger mr-10">Delete</button>
                                                        <button id={collection} onClick={handelDownload} className="btn btn-success">Download</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </>}
                                </div>
                                <div class="modal-footer">
                                    <button type="button" id={currentDB} onClick={handelDeleteDB} class="btn btn-outline-danger">Delete Database</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="home-container-main-right">
                    <h1 className="m-2 p-2">Upload csv file</h1>
                    {selectedFile === null ?
                        <div className="dropbox" {...getRootProps()}>
                            <section>
                                <input {...getInputProps()} />
                                {
                                    isDragActive ?
                                        <p className="success">Drop the <BsFiletypeCsv /> files here ...</p> :
                                        <p>Drag and drop <BsFiletypeCsv /> file here, or click to select files</p>
                                }
                            </section>
                        </div>
                        :
                        <div className="dropbox">
                            <section className="file-upload">
                                <h2><BsFiletypeCsv /></h2>
                                <span>{seletedFileName} File Selected </span>
                                <div>
                                    <label htmlFor="">Select the database to upload :</label>
                                    <select name="" id="" onChange={handelUserSelectedDB} value={userSelectedDB}>
                                        {databases.map((database, i) => (
                                            <option key={i} value={database}>{database}</option>
                                        ))}
                                    </select>
                                </div>
                            </section>
                        </div>
                    }
                    {uploading ?
                        <Stack className="uploading-bar" sx={{ color: 'grey.800' }} spacing={2} direction="row">
                            <CircularProgress color="success" /><span>Uploading.....</span>
                        </Stack>
                        :
                        <>
                            {selectedFile && <button onClick={(e) => (setselectedFile(null), setseletedFileName(null))} type="button" class="btn btn-warning">Change</button>}
                            {selectedFile && <button onClick={handelUploadFile} type="button" class="btn btn-info">Upload</button>}
                        </>
                    }
                </section>
            </div>
            <ToastContainer
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    )
}

export default Home