import React from 'react';
import toast from 'react-hot-toast';

const ContestCard = ({ contest,admin,contests,SetContests}) => {
  const {title, description, id, startTime, endTime } = contest;
  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };
  const enterContest=async ()=>{
    try{
      const allowed=await fetch(`http://localhost:3000/api/contests/getTime/${id}`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          startTime
        }),
        credentials:'include'
      })
      const content= await allowed.json();
      if(content.ok)
        window.location.href=`/contests/${id}`
      else{
        toast.error('This Contest has not started yet')
      }
    }catch(err){
      console.log(err)
    }
  }
  const DeleteContest=async ()=>{
    try{
      const res=await fetch(`http://localhost:3000/api/deleteContest/${id}`,{
        method:'GET',
        headers:{
          'Content-Type':'application/json'
        },
        credentials:'include'
      })
      return res.json()
    }catch(err)
    {
      console.log(err)
      return false
    }
  }
  const handleDelete = async () => {
    const isDeleted = await DeleteContest();
    if(isDeleted.ok){
      // Filter out the deleted contest from the list
      SetContests((prevContests) => prevContests.filter((e) => e.id !== id));
      console.log(contests)
    }
    else{
      if(isDeleted.msg){
        toast.error(isDeleted.msg)
      }
    }

  };

  return (
    <div className="w-full max-w-2xl p-6 mb-6 bg-white shadow-md rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-indigo-700">{title}</h1>
        <p className="text-gray-600">{description}</p>
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span><strong>Start:</strong> {formatDateTime(startTime)}</span>
          <span><strong>End:</strong> {formatDateTime(endTime)}</span>
        </div>
        <div className="mt-4 text-right">
          {admin ? ( 
            <button
            onClick={()=>handleDelete()}
            className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition m-4"
          >
            Delete
          </button>): null
          }
          <button
            onClick={enterContest}
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            View Contest
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContestCard;
