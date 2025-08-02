import React from 'react'

const Challenge_button = ({admin}) => {
  const sendToChallenge= () => {
    // Redirect to the admin contest creation page
    window.location.href = '/admin/problem';
  }
  console.log(admin);
  return admin===true ? 
   (
    <button className='bg-green-600 text-white rounded-lg p-2 hover:bg-green-700' onClick={()=>sendToChallenge()}>Create Challenge</button>
  ) : <button className='bg-gray-400 text-white rounded-lg p-2' disabled>Not Authorized (challenge)</button>
  
}
export default Challenge_button