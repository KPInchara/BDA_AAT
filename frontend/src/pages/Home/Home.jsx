import React, { useState, useEffect } from "react"
import axios from "axios"
import './Home.css';
import Navbar from "../../components/Navbar";
function Home() {
    const [databases, setDatabases] = useState([]);
    const [collections, setcollections] = useState([])
    useEffect(() => {
        fetchDataBaseNames();
    }, []);
    const handelDb_select=async(e)=>{
        try {
            const response = await axios.get(`http://127.0.0.1:5000/get_collections?db=${e.target.value}`); // Assuming the React app is hosted on the same domain as the Flask server
            setcollections(response.data.collections);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    const fetchDataBaseNames = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/databaseNames'); // Assuming the React app is hosted on the same domain as the Flask server
            setDatabases(response.data.databaseNames)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    return (
        <div className="home">
            <Navbar />
            <div className="home-container-bg"></div>
            <div className="home-container-main">
                <section className="home-container-main-left">
                    <select name="" id="" onChange={handelDb_select}>
                        {databases.map((database,id) => (
                            <option key={id} value={database}>{database}</option>
                        ))}
                    </select>
                    <div className="collections">
                        <ul>
                            {collections.map((collection,id)=>(
                                <li key={id}>{collection}</li>
                            ))}
                        </ul>
                    </div>
                </section>
                <section className="home-container-main-right">

                </section>
            </div>
        </div>
    )
}

export default Home