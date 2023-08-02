import React, { useState } from 'react';
import './Signin.css';
import axios from "axios"
const Signin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit =async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      const response=await axios.post("http://127.0.0.1:5000/login",formData)
      console.log(response);
    } catch (error) {
      console.log(error);
    }
   
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
            <center><button type="submit">Sign In</button> </center>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signin;