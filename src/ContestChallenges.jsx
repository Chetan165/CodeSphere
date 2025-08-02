import React, { useEffect } from 'react'
import { useState } from 'react';
import toast from 'react-hot-toast';
import ChallengeCard from './ChallengeCard';
import { useParams } from 'react-router-dom';
import UserAuth from './UserAuth';

const ContestChallenges = () => {
  const [User,setUser]=useState();
  const [Challenges,SetChallenges]=useState([])
  const ContestId=useParams().id;

  const fetchChallenges=async ()=>{
    try{
        const res=await fetch('http://localhost:3000/api/ContestChallenges',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                problemId:ContestId
            }),
            credentials:'include'
        })
        const fetchedChallenges=await res.json();
        if(fetchedChallenges && fetchedChallenges.ok){
            SetChallenges(fetchedChallenges.collections.problems);
            
        }
        else{
            toast.error('Error Fetching Challenges');
        }
    }catch(err){
        console.log(err)
    }
  }
  useEffect(()=>{
    UserAuth(setUser)
    fetchChallenges();
  },[])
  useEffect(()=>{
    Challenges.forEach((val,index)=>{
      if(!localStorage.getItem(`${val.id}`))
        localStorage.setItem(`${val.id}`,JSON.stringify(val))
    })
  },[Challenges])
  return User && User.uid ? (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-white px-4'>
        <ul>
      {
        Challenges.map((val, index) => {
         return (
        <li key={val.id}>
          <ChallengeCard key={index} id={val.id} Contestid={ContestId} title={val.title}></ChallengeCard>
        </li>
        );
       })
     }
     </ul>

   </div>
  ) :<div></div>
}

export default ContestChallenges