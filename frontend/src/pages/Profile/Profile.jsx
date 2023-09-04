import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar/Navbar.jsx'
import axios from "axios"
import "./Profile.css"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
function Profile() {
  const userData = JSON.parse(localStorage.getItem("user"))
  const [email, setemail] = useState(userData.email)
  const imageurl=JSON.parse(localStorage.getItem("image"))
  const [user_image, setuser_image] = useState(null)
  const [loading, setloading] = useState(false)
  const states_in_india = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Lakshadweep",
    "Delhi",
    "Puducherry"
  ]
  useEffect(() => {
    get_user()
    get_image()
  }, [loading])
  const animatedComponents = makeAnimated();
  const [modifiedFields, setModifiedFields] = useState(new Set());
  const [user, setuser] = useState({
    username: userData?.username || "",
    firstName:userData?.firstName || "",
    lastName: userData?.lastName || "",
    password: userData?.password || "",
    email: userData?.email || "",
    contactNumber: userData?.contactNumber || "",
    address: userData?.address || "",
    city: userData?.city || "",
    state: userData?.state || "",
    img:imageurl|| "",
    skills: 
      userData?.skills?.map(e=>(
        { value: e, label: e }
      )) ||
       []
  })
  const [selectedSkills, setSelectedSkills] = useState(user.skills);
  const skillsOptions = [
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'js', label: 'JavaScript' },
    { value: "react", label: "React" }
  ];
 
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
  const get_user = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/getUser?useremail=${email}`)
      if (response.status == 200) {
        //src="data:image/jpeg;base64,{{ response.data.image }}"
        localStorage.setItem("user", JSON.stringify(response.data))
      }
    } catch (error) {
      console.log(error);
    }
  }
  const get_image = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/getImage?useremail=${email}`,
      {
        responseType: 'blob',
        headers: {
          Accept: 'image/*'
        }
    })
      if (response.status == 200) {
        const imageURL = URL.createObjectURL(new Blob([response.data]));
        setuser_image(imageURL)
        localStorage.setItem("image", JSON.stringify(imageURL))
      }
    } catch (error) {
      console.log(error);
      alert("error")
    }
  }
  const [isChecked, setIsChecked] = useState(false);
  const handelLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("image")
    window.location.href = "/signin"
  }
  const handelUserDataChange = (e) => {
    setuser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setModifiedFields((prevFields) => prevFields.add(e.target.name));
  }
  const handleUserSkillsChange = (selectedOptions) => {
    setSelectedSkills(selectedOptions);
    setuser((prev) => ({ ...prev, skills: selectedOptions }));
    setModifiedFields((prevFields) => prevFields.add("skills"));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setloading(true)
    const modifiedData = {};
    const formData = new FormData();
    modifiedFields.forEach((field) => {
      if(field!="skills"){
        modifiedData[field] = user[field];
        formData.append(field, modifiedData[field]);
      }else{
        const skills = user[field].map(item => item.value);
        modifiedData[field] = skills;
        console.log(modifiedData[field])
        formData.append(field,JSON.stringify(modifiedData[field]));
      }

    });
    try {
      const response = await axios.put(`http://127.0.0.1:5000/update_user?email=${email}`, formData)
      console.log(response.data);
      if (response) {
        //localStorage.setItem("user", response.data.user)
        notify("success", "Succesfully updated data")
        setloading(false)
      }
    } catch (error) {
      console.log(error);
      notify("error", "Failed to update the data")
      setloading(false)
    }
  }
  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };
  const handeldeleteUser=async()=>{
    try {
      const deleteResponse=await axios.delete(`http://127.0.0.1:5000/delete_user?email=${email}`)
      console.log(deleteResponse);
      if(deleteResponse.status===200){
        notify("success",deleteResponse.data)
        handelLogout()
      }
    } catch (error) {
      console.log(error);
      notify("error", "Failed to delete User")
    }
  }
  return (
    <div className='profile'>
      <Navbar />
      <div className="profile-container-bg"></div>
      <div className="profile-container-main">
        <section className='profile-container-left'>
          <div className="profile-image">
            {user_image===null ?
              <img src="/images/deafult-profile-tag.png" alt="" srcset="" />: <img src={user_image} alt="" srcset="" /> 
            }
            <h1>{user.username}</h1>
            <div>
              <div className="mb-2">
                <label class="form-label">Email</label>
                <input value={user.email} disabled class="form-control" />
              </div>
              <div class="mb-2">
                <label class="form-label">Password</label>
                <input id='password' type={isChecked ? "text" : "password"} onChange={handelUserDataChange} class="form-control" value={user.password} disabled />
                <div id='password-checkbox' class="form-check">
                  <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} class="form-check-input" />
                  <label class="form-check-label" >Show Password</label>
                </div>
              </div>

            </div>
          </div>
          <button type="button" onClick={handeldeleteUser} class="btn btn-danger">Delete Account</button>
          <button type="button" onClick={handelLogout} class="btn btn-danger">Logout</button>
        </section>
        <section className='profile-container-right'>
          <div className='user-data'>
            <form onSubmit={handleSubmit}>
              <div className="user">
                <div class="mb-3">
                  <label class="form-label">First Name</label>
                  <input type="text" onChange={handelUserDataChange} value={user.firstName} name="firstName" class="form-control" />
                </div>
                <div class="mb-3">
                  <label class="form-label" >Last Name</label>
                  <input type="text" onChange={handelUserDataChange} value={user.lastName} name="lastName" class="form-control" />
                </div>
              </div>
              <div className="user">
                <div class="mb-3">
                  <label class="form-label">User Name</label>
                  <input type="text" onChange={handelUserDataChange} value={user.username} name="username" class="form-control" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Contact Number</label>
                  <input type="number" onChange={handelUserDataChange} value={user.contactNumber} name="contactNumber" class="form-control" />
                </div>
              </div>
              <div class="form-floating mb-3">
                <label for="floatingTextarea">Address</label>
                <textarea class="form-control" onChange={handelUserDataChange} value={user.address} name="address" id="floatingTextarea"></textarea>
              </div>
              <div className="user">
                <div class="mb-3">
                  <label class="form-label">City</label>
                  <input type="text" onChange={handelUserDataChange} value={user.city} name="city" class="form-control" />
                </div>
                <div class="mb-3">
                  <label class="form-label">State</label>
                  <select class="form-control" value={user.state} onChange={handelUserDataChange} name="state" id="">
                    {states_in_india.map((state, id) => (
                      <option value={state} name={state} key={id}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label class="form-label">Skills</label>
                <Select className='skills'
                  closeMenuOnSelect={false}
                  components={animatedComponents}
                  defaultValue={selectedSkills.map((skill, i) => (user.skills[i]))}
                  isMulti
                  options={skillsOptions}
                  onChange={handleUserSkillsChange}
                />
              </div>
              {loading ?
                <button class="btn btn-primary" type="button" disabled>
                  <span class="spinner-grow spinner-grow-sm" aria-hidden="true"></span>
                  <span role="status">Updating please wait...</span>
                </button> :
                <button type="submit" class="btn btn-secondary">Update</button>
              }
             
            </form>
          </div>
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

export default Profile