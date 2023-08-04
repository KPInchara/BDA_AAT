import React, { Component, useState } from "react";
import './Signup.css';
import axios from "axios"
export default function Signup() {
  const [Username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setimage] = useState(null)
  const [loading, setloading] = useState(false)
  const handleSubmit = async(e) => {
      e.preventDefault();
      setloading(true)
      console.log(image);
      if(Username.length===0 || email.length===0 || password.length<=7)  {
        setloading(false)
        alert("Please enter correct details") 
        return
      }
      const formData = new FormData();
      formData.append("username", Username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append('image', image);
      try {
        const response=await axios.post("http://127.0.0.1:5000/createUser",formData)
        if(response.data){
          localStorage.setItem("user",JSON.stringify(response.data))
          setloading(false)
          try {
            const image = await axios.get(`http://127.0.0.1:5000/getImage?useremail=${response.data["email"]}`,
            {
              responseType: 'blob',
              headers: {
                Accept: 'image/*'
              }
          })
            if (image) {
              const imageURL = URL.createObjectURL(new Blob([image.data]));
              localStorage.setItem("image", JSON.stringify(imageURL))
                alert("Registration Succesfully done")
          window.location.href="/"
            }
          } catch (error) {
            alert("try again")
            window.location.href="/signup"
          }
        }
      } catch (error) {
        console.log(error);
        alert(error.response.data.error)
        window.location.href="/signup"
        setloading(false)
      }
      
  };

  return (
 <div>
  <div className="signup-container-bg"></div>
  <div className="signup-container-main">
  <div className="auth-wrapper">
      <div className="auth-inner">
      <h3>Sign Up</h3>        
        <form onSubmit={handleSubmit}  enctype="multipart/form-data">
          <div className="mb-3">
            <label> Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="First name"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Upload Image</label>
            <input
              accept="images"
              type="file"
              className="form-control"
              placeholder="upload image"
              onChange={(e) => setimage( e.target.files[0])}
            />
          </div>
          <div className="d-grid">
           {loading ? <button className="btn btn-primary">Loading...</button> : <button type="submit" className="btn btn-primary">
              Sign Up
            </button>}
          </div>
          <p className="forgot-password text-right">
            Already registered <a href="/Signin">Signin?</a>
          </p>
        </form>
      </div>
    </div>
  </div>
 </div>
  );
}