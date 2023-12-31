import React from 'react'
import {BiLogOut} from "react-icons/bi"
import "./Navbar.css"
function Navbar() {
    const handelLogout=()=>{
        localStorage.removeItem("user")
        localStorage.removeItem("image")
        window.location.href="/signin"
    }
  return (
    <nav class="navbar navbar-expand-lg  navbar-dark bg-primary">
                <a class="navbar-brand" >BDA_AAT</a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNavDropdown">
                    <ul class="navbar-nav">
                        <li class="nav-item active">
                            <a class="nav-link" href="/">Home </a>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                              Services
                            </a>
                            <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                                <a class="dropdown-item" href="/profile">Profile</a>
                                <a class="dropdown-item" href="/analysis">Analysis</a>
                                <hr />
                                <a class="dropdown-item" style={{cursor:"pointer",fontSize:"18px",padding:"8px"}} onClick={handelLogout}><BiLogOut style={{width:"40px",padding:"0px"}}/> Logout</a>
                            </div>
                        </li>
                    </ul>
                </div>
            </nav>
  )
}

export default Navbar