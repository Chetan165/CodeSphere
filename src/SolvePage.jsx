import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import UserAuth from './UserAuth'
import {toast,LoaderIcon} from 'react-hot-toast'
import * as Dialog from '@radix-ui/react-dialog';
import pollJudge0 from './PollingSubmissions';



const SolvePage = () => {
  const constid=useParams().ContestId
  const id=useParams().id;
  const [showResult,setShowResult]=useState(false)
  const [loading,setloading]=useState(false);
  const [User,setUser]=useState();
  const [Code,SetCode]=useState('')
  const [submissionResult,SetsubmissionResult]=useState([])
  const [tokens,setTokens]=useState([])
  const [languageId, setLanguageId] = useState(54); // Default: C++
  const [Submission,SetSubmission]=useState({
    Code:Code,
    problemId:id,
    ContestId:constid,
    languageId:languageId,
    uid: User?.uid || '' 

  })
  const languageOptions = [
  { id: 54, name: "C++ (GCC 9.2.0)" },
  { id: 62, name: "Java (OpenJDK 13.0.1)" },
  { id: 71, name: "Python (3.8.1)" },
];
  const [ChallengeDetails,SetChallengeDetails]=useState(JSON.parse(localStorage.getItem(`${id}`)) || null)
  useEffect(()=>{
    UserAuth(setUser)
  },[])
  useEffect(()=>{
    SetSubmission({
    Code:Code,
    problemId:id,
    ContestId:constid,
    languageId:parseInt(languageId),
    uid: User?.uid || ''
    })
  },[User,languageId,Code,constid,id])
  useEffect(()=>{
    console.log(Submission)
  },[languageId,Submission,Code])
  const Submit=async ()=>{
    try{
       if(Code.trim()=='' || !Code){
         throw Error('Empty Code field')
       }
        setShowResult(true)
        setloading(true);
        const res=await fetch('http://localhost:3000/api/Submission/submit',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                Submission
            }),
            credentials:'include'
        })
        const result=await res.json();
        if(result.ok){
          setTokens(result.tokens);
          try{
            const results=await pollJudge0(result.tokens) 
            let verdict = "Accepted";
            let score = 0;
            let max_id = 3;
            for (let r of results) {
              if (r.status.id === 3) score += 10;
              max_id = Math.max(max_id, r.status.id);
            }
            if (max_id >= 6) verdict = "Error";
            else if (max_id === 4) verdict = "Wrong Answer";
            else if (max_id === 5) verdict = "Time Limit Exceeded";
    
            setloading(false);
            SetsubmissionResult({ result: results, verdict, score });
            try{
              const res=await fetch('http://localhost:3000/api/UpdateSubmission',{
                method:'POST',
                headers:{
                  'Content-Type':'application/json'
                },
                body:JSON.stringify({
                  uid:Submission.uid,
                  problemId:Submission.problemId,
                  ContestId:Submission.ContestId,
                  Code:Submission.Code,
                  lang_id:Submission.languageId,
                  verdict,
                  score,
                })
              })
              const result=await res.json();
              if(!result.ok){
                throw Error('internal server error')
              }
            }catch(err){
              console.log(err)
            }
          }
          catch(err){
            toast.error(err.message);
          }
        }
        else{
          toast.error(result.message);
        }
    }catch(err){
        toast.error(err.message)
    }
  }
    return (
    <>
     <h1 className='text-3xl capitalize font-bold m-2'>{ChallengeDetails.title}</h1>
       <div className='min-h-screen flex flex-col items-start justify-start bg-gradient-to-br from-indigo-100 to-white px-4 py-10'>
        <h1 className='font-semibold m-2'>Problem Statement:</h1>
        <p className='italic text-justify'>{ChallengeDetails.statement}</p>
        <h1 className='font-semibold m-2 mt-10'>Input Format:</h1>
        <p className='text-justify'>{ChallengeDetails.inputFormat}</p>
        <h1 className='font-semibold m-2 mt-10'>Output Format:</h1>
        <p className='text-justify'>{ChallengeDetails.outputFormat}</p>
        <h1 className='font-semibold m-2 mt-10'>Constraints:</h1>        
        <p className='text-justify'>{ChallengeDetails.constraints}</p>
        <h1 className='font-semibold m-2 mt-10'>Sample Input:</h1>        
        <pre className='text-justify'>{ChallengeDetails.sampleInput}</pre>
        <h1 className='font-semibold m-2 mt-10'>Sample Output:</h1>        
        <pre className='text-justify'>{ChallengeDetails.sampleOutput}</pre>
        <select className='mt-10' onChange={(e) => setLanguageId(e.target.value)}>
          {languageOptions.map((lang) => (
          <option key={lang.id} value={lang.id}>
          {lang.name}
          </option>
        ))}
        </select>
        <textarea className=' mt-10 w-full'placeholder='Enter your Code here' onChange={(e)=>SetCode(e.target.value)}></textarea>
        <button className='bg-green-600 hover:bg-green-700 p-2 rounded-md mt-10 mx-2' onClick={()=>Submit()}>Submit</button>
    </div>
    <Dialog.Root open={showResult} onOpenChange={setShowResult}>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/50" />
    <Dialog.Content className="fixed top-1/2 left-1/2 bg-white rounded-lg p-6 w-[90vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 shadow-lg">
      {loading ? (
        <div className="flex justify-center items-center h-40">
            <LoaderIcon className='size-7'></LoaderIcon>
            <span className="ml-4 text-gray-600">Evaluating submission...</span>
        </div>

      ) : (
        <>
          <Dialog.Title className="text-xl font-bold ">Submission Result</Dialog.Title>
          <div className="my-2">
            <p><strong>Overall Verdict:</strong> <span className={`${submissionResult.verdict=='Accepted' ? 'text-green-600': 'text-red-600'} text-xl font-semibold`}>{submissionResult.verdict}</span></p>
            <p><strong>Score:</strong> {submissionResult.score}</p>
          </div>

          <table className="w-full text-left mt-4 border-collapse">
            <thead>
              <tr>
                <th>Test Case</th>
                <th>Status</th>
                <th>Time</th>
                <th>Memory</th>
              </tr>
            </thead>
            <tbody>
              {submissionResult.result?.map((res, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{res.status.description}</td>
                  <td>{res.time ?? '-'}</td>
                  <td>{res.memory ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <Dialog.Close asChild>
        <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded">Close</button>
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
    </>
  )
}

export default SolvePage