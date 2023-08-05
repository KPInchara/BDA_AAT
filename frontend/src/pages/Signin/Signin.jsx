import React, { useState } from 'react';
import './Signin.css';
import axios from "axios"
const Signin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setloading] = useState(false)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setloading(true)
    try {
      const response = await axios.post("http://localhost:5000/login", formData)        
      localStorage.setItem("user", JSON.stringify(response.data.user))
      console.log(response.data);
      alert(response.data.message)
      if(response.data.user){
        alert(response.data.message)
        window.location.href="/"
      }
      else{
        alert(response.data.message)
        window.location.href="/signin"
      }
      // if (response) {
      //   try {
      //     const image = await axios.get(`http://127.0.0.1:5000/getImage?useremail=${response.data.user["email"]}`,
      //       {
      //         responseType: 'blob',
      //         headers: {
      //           Accept: 'image/*'
      //         }
      //       })
      //       console.log(image);
      //     if (image) {
      //       console.log(image);
      //       const imageURL = URL.createObjectURL(new Blob([image.data]));
      //       localStorage.setItem("image", JSON.stringify(imageURL))
      //       alert(response.data.message)
      //       window.location.href="/"
      //     }
      //   } catch (error) {
      //     console.log(error);
      //     alert("try again")
      //     window.location.href="/signin"
      //   }
      // }
      // else {
      //   alert("try again")
      //   window.location.href="/signin"
      //}

    } catch (error) {
      console.log(error);
      alert("Failed try again")
      window.location.href = "/signin"
    }
    setloading(false)
  };

  return (
    <div>
      <div className="signin-container-bg"></div>
      <div className="signin-container-main">
        <div className="signin-container">
          <h2>Sign In</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Useremail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />

            </div>
            <p className="forgot-password text-right">
              create an acoount? <a href="/Signup">Signup</a>
            </p>

            {loading ? <p className="forgot-password text-right">Loading....</p> : <center><button type="submit">Sign In</button> </center>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signin;