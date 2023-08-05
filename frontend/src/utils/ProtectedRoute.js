import React,{useEffect,useContext} from 'react'
import {useNavigate} from "react-router-dom"
function ProtectedRoute(props) {
  const {Component}=props
  const navigate=useNavigate()
  useEffect(()=>{
    const userData = JSON.parse(localStorage.getItem("user")) || null
    if(userData===null){
        navigate("/signin")
    }
  },[])
  return (
    <><Component/></>
  )
}

export default ProtectedRoute