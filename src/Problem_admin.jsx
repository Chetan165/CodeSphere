import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ProblemCreationForm() {
  const [zip, SetZip] = useState(null);
  const[problemId,SetProblemId]=useState(null);
  const handleUpload=async ()=>{
      if(!problemId){
        toast.error("Please Click Add Problem first before uploading the testcase");
        return
      }
      try{
      const formData= new FormData();
      formData.append('zip',zip);
      formData.append('problemId',problemId);
      const res= await fetch("http://localhost:3000/api/upload-testcases", {
        method:"POST",
        body: formData,
        credentials: 'include',
      })
      const response=await res.json();
      if(response && response.ok){
        toast.success(response.message);
        SetZip(null);
        setTimeout(()=>window.location.href='/contests',500)
      }
      else{
        toast.error(response.message);
      }

    }catch(err){
      console.log(err)
    }
  }
  const fetchUser=async ()=>{
    try{
      const response=await fetch('http://localhost:3000/api/user',{
        method:'GET',
        headers:{
          'Content-Type':'application/json'
        },
        credentials:'include'
      })
      const user=await response.json();
      if(user && user.uid && user.admin){
         console.log(user.admin,user.uid)
      }
      else{
        window.location.href='/'
      }
    }
    catch(err){
      console.log(err)
    }
  }
  useEffect(()=>{
    fetchUser()
  },
  [])
  const [form, setForm] = useState({
    title: "",
    statement: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    sampleInput: "",
    sampleOutput: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/admin/contest/problem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (data.ok) {
      toast.success(data.message);
      SetProblemId(data.problemId);
    } else {
      toast.error("Failed to create problem");
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
      <input name="title" placeholder="Problem Title" onChange={handleChange} required className="w-full border p-2" />
      <textarea name="statement" placeholder="Problem Statement" onChange={handleChange} required className="w-full border p-2" />
      <input name="inputFormat" placeholder="Input Format" onChange={handleChange} required className="w-full border p-2" />
      <input name="outputFormat" placeholder="Output Format" onChange={handleChange} required className="w-full border p-2" />
      <input name="constraints" placeholder="Constraints" onChange={handleChange} required className="w-full border p-2" />
      <textarea name="sampleInput" placeholder="Sample Input" onChange={handleChange} required className="w-full border p-2" />
      <textarea name="sampleOutput" placeholder="Sample Output" onChange={handleChange} required className="w-full border p-2" />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Add Problem</button>
    </form>
     <div className="bg-indigo-200 h-100 w-full p-3">
      <input type="file" accept=".zip" onChange={(e)=>SetZip(e.target.files[0])}></input>
      <button
        onClick={()=>handleUpload()}
        className="bg-indigo-600 text-white px-4 py-2 rounded mt-2"
      >
        Upload Test Cases
      </button>
     </div>
    </>
  );
}
