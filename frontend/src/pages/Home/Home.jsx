import React, { useState, useEffect, useCallback } from "react"
import axios from "axios"
import './Home.css';
import Navbar from "../../components/Navbar";
import { useDropzone } from 'react-dropzone'
import { BsFiletypeCsv, BsFillDatabaseFill } from 'react-icons/bs'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function Home() {
    const [databases, setDatabases] = useState([]);
    const [currentDB, setcurrentDB] = useState(null)
    const [collections, setcollections] = useState([])
    const [selectedFile, setselectedFile] = useState(null)
    const [seletedFileName, setseletedFileName] = useState(null)
    useEffect(() => {
        fetchDataBaseNames();
    }, []);
    const notify = (type,msg) => {
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
            const response = await axios.get('http://127.0.0.1:5000/databaseNames'); // Assuming the React app is hosted on the same domain as the Flask server
            setDatabases(response.data.databaseNames)
            setcurrentDB(response.data.databaseNames[0])
            // const response2 = await axios.get(`http://127.0.0.1:5000/get_collections?db=${currentDB}`); // Assuming the React app is hosted on the same domain as the Flask server
            // setcollections(response2.data.collections);
            // console.log(collections,currentDB);
        } catch (error) {
            console.error('Error fetching data:', error);
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
        console.log(currentDB,e.target.id);
        try {
            const response = await axios.delete(`http://127.0.0.1:5000/delete_collections?db=${currentDB}&collection=${e.target.id}`)
            console.log(response.data);
            if(response.status===200){
                notify("success",`${e.target.id} Deleted from ${currentDB} Database`)
            }
        } catch (error) {
            console.log(error);
        }
    }
    const onDrop = useCallback(acceptedFile => {
        if (acceptedFile[0].type != "text/csv") return notify("info","Only CSV files are allowed")
        setselectedFile(acceptedFile[0])
        setseletedFileName(acceptedFile[0].path)
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
    const handelUploadFile = async () => {
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            const response = await axios.post(`http://127.0.0.1:5000/upload`, formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
            if (response.status === 200) {
                notify("success",`${seletedFileName} Uploaded Sucessfully`)
                setselectedFile(null)
                setseletedFileName(null)
            }
        } catch (error) {
            console.log(error);
            notify("error",`${seletedFileName} Failed to Upload`)
            setselectedFile(null)
            setseletedFileName(null)
        }
    }
    const handelViewModal = async (e) => {
        console.log(e.target.id);
        setcurrentDB(e.target.id)
        try {
            setcollections(null)
            const response = await axios.get(`http://127.0.0.1:5000/get_collections?db=${e.target.id}`); // Assuming the React app is hosted on the same domain as the Flask server
            setcollections(response.data.collections);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    return (
        <div className="home">
            <Navbar />
            <div className="home-container-bg"></div>
            <div className="home-container-main">
                <section className="home-container-main-left">
                    <h1 className="m-2 p-2">Import File</h1>
                    <div className="collections">
                        <ul>
                            {databases.map((database, id) => (
                                <div  key={id} className="database-name">
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
                                    {collections && collections.map((collection, id) => (
                                        <div className="collections-tag" key={id}>
                                            <li >{collection}</li>
                                            <div>
                                                <button id={collection} onClick={handelDelete} className="btn btn-danger mr-10">Delete</button>
                                                <button id={collection} onClick={handelDownload} className="btn btn-success">Download</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="home-container-main-right">
                    <h1 className="m-2 p-2">Upload csv file</h1>
                    <div className="dropbox" {...getRootProps()}>
                        {selectedFile === null ?
                            <section>
                                <input {...getInputProps()} />
                                {
                                    isDragActive ?
                                        <p className="success">Drop the <BsFiletypeCsv /> files here ...</p> :
                                        <p>Drag and drop <BsFiletypeCsv /> file here, or click to select files</p>
                                }
                            </section> :
                            <section className="file-upload">
                                <h2><BsFiletypeCsv /></h2>
                                <span>{seletedFileName} File Selected </span>
                            </section>
                        }
                    </div>
                    {selectedFile && <button onClick={(e) => (setselectedFile(null), setseletedFileName(null))} type="button" class="btn btn-warning">Change</button>}
                    {selectedFile && <button onClick={handelUploadFile} type="button" class="btn btn-info">Upload</button>}
                </section>
            </div>
            <ToastContainer
                autoClose={5000}
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