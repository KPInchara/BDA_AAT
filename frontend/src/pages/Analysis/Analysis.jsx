import React, { useState,useEffect } from 'react'
import "./Analysis.css"
import axios from "axios"
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Navbar from "../../components/Navbar/Navbar.jsx";
function Analysis() {
  const [key, setKey] = useState('prosody');
  const [type, settype] = useState(null)
  const [user_input, setuser_input] = useState(null)
  const [firstloading, setfirstloading] = useState(false)
  const [secondloading, setsecondloading] = useState(false)
  const [user_input_EK, setuser_input_EK] = useState(null)
  const [text_count, settext_count] = useState(0)
  const [emotion_count, setemotion_count] = useState(0)
  const [noemotion_count, setnemotion_count] = useState(0)
  const handel_submit=async(e)=>{
    e.preventDefault();
    settype(null)
    const formData = new FormData();
    formData.append("key", user_input);
    setsecondloading(true)
    try {
      const response =await axios.post(`http://127.0.0.1:5000/predictSentence`,formData)
      if(response.status===200){
        settype(response.data.type)
        document.querySelector("#user_input").value=null    
        setsecondloading(false)    
      }
    } catch (error) {
      console.log(error);
      setsecondloading(false)
    }
  }
  const handel_submit_EK=async(e)=>{
    e.preventDefault();
    const formData = new FormData();
    formData.append("key", user_input_EK);
    setfirstloading(true)
    try {
      const response =await axios.post(`http://127.0.0.1:5000/convertEK`,formData)
      if(response.status===200){
        console.log(response);
        // settype(response.data.type)
        setuser_input("aaaaaaa")
        // document.querySelector("#user_input").value=null      
        setfirstloading(false)  
      }
    } catch (error) {
      console.log(error);
      setfirstloading(false)
    }
  }
  useEffect(() => {
   handel_values()
  }, [])
  
  const handel_values=async()=>{
    try {
      const response=await axios.get(`http://127.0.0.1:5000/getCounts`)
      if(response.status===200){
        setemotion_count(response.data.emotion_count)
        setnemotion_count(response.data.noemotion_count)
        settext_count(response.data.text_count)
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className='analysis'>
      <Navbar />
      <div className="analysis-container-bg"></div>
      <div className="analysis-container-main">
        <div className='analysis-container-wrapper'>
          <Tabs
            id="controlled-tab-example"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3"
          >
            <Tab eventKey="prosody" title="ಕನ್ನಡ ವಾಕ್ಯ ಭಾವನೆಗಳ ಪತ್ತೆ">
              <section className='analysis-prosody'>
                <div className="prosody-data">
                <div class="mb-3">
                    <label  class="form-label">ಡೇಟಾಸೆಟ್‌ನ ಒಟ್ಟು ಸಂಖ್ಯೆ :</label>
                    <input type="number" class="form-control"  value={text_count} disabled/>
                  </div>
                  <div class="mb-3">
                    <label  class="form-label">ಭಾವನೆಯ ಲೇಬಲ್‌ನ ಒಟ್ಟು ಸಂಖ್ಯೆ :</label>
                    <input  type="number" class="form-control"  value={emotion_count} disabled/>
                  </div>
                  <div class="mb-3">
                    <label  class="form-label">ಭಾವನೆ ಇಲ್ಲದಾ ಲೇಬಲ್‌ನ ಒಟ್ಟು ಸಂಖ್ಯೆ :</label>
                    <input  type="number" class="form-control"  value={noemotion_count} disabled />
                  </div>
                  <form onSubmit={handel_submit_EK}>         
                  <div class="mb-3">
                    <label  class="form-label">ಇಂಗ್ಲಿಷ್‌ನಿಂದ ಕನ್ನಡಕ್ಕೆ</label>
                    <input disabled id='user_input' onChange={e=>setuser_input_EK(e.target.value)} type="text" class="form-control" />
                  </div>
                  {user_input_EK !=null &&<button type="submit" disabled={firstloading} class="btn btn-primary">ಪರಿವರ್ತಿಸಿ</button>}
                </form>
                <form onSubmit={handel_submit}>         
                  <div class="mb-3">
                    <label  class="form-label">ಕನ್ನಡ ವಾಕ್ಯವನ್ನು ನಮೂದಿಸಿ :</label>
                    <input id='user_input' onChange={e=>setuser_input(e.target.value)} value={user_input}  type="text" class="form-control" />
                  </div>
                  {user_input !=null &&<button type="submit" disabled={secondloading} class="mb-3 btn btn-primary">ಸಲ್ಲಿಸು</button>}
                </form>
                  </div>    
                <div className="prosody-output">
                <div class="mb-3">
                    <label  class="form-label">ನಿಮ್ಮ ವಾಕ್ಯ :</label>
                    <input  type="text" class="form-control"  value={user_input} disabled />
                  </div>
                  {type ===null ? "":<>{ type==="EMOTION" ?<h1>ನಿಮ್ಮ ವಾಕ್ಯದಲ್ಲಿ ಭಾವನೆ ಇದೆ</h1>:<h1>ನಿಮ್ಮ ವಾಕ್ಯದಲ್ಲಿ ಭಾವನೆ ಇಲ್ಲ</h1>}</>}
                </div>
              </section>
            </Tab>
            {/* <Tab eventKey="crime" title="Crime Analysis">
              Tab content for crime Analysis
            </Tab>
            <Tab eventKey="prediction" title="Crime Prediction" >
              Tab content for prediction
            </Tab> */}
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default Analysis