import React, { useState, useEffect } from "react"
import axios from "axios"
function Home() {
    const [data, setData] = useState([]);
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/'); // Assuming the React app is hosted on the same domain as the Flask server
         
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    return (
        <div>{data}</div>
    )
}

export default Home