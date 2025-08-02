import React from 'react'

const Contest_button = ({admin}) => {
  const sendToAdmin= () => {
    // Redirect to the admin contest creation page
    window.location.href = '/admin/contest';
  }
  console.log(admin);
  return admin===true ? 
   (
    <button className='bg-green-600 text-white rounded-lg p-2 hover:bg-green-700' onClick={()=>sendToAdmin()}>Create Contest</button>
  ) : <button className='bg-gray-400 text-white rounded-lg p-2' disabled>Not Authorized(contest)</button>
  
}
export default Contest_button