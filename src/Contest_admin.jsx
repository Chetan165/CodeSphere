import { useState,useEffect } from "react";
import toast from "react-hot-toast";
import UserAuth from "./UserAuth";

export default function ContestCreationForm() {
  const [user, setUser] = useState();
  const [problems,SetProblems]=useState([]);
  const [search,SetSearch]=useState('');
  const [chosenProblems,SetChosenProblems]=useState([]);
  const fetchProblem=async ()=>{
    try{
      const res=await fetch('http://localhost:3000/api/problems',{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          search:search
        }),
        credentials:'include'
      })
      const response=await res.json();
      if(response && response.ok){
        SetProblems(response.problems)
      }
    }catch(err){
      console.log(err.json())
    }
  }

  useEffect(() => {
    UserAuth(setUser);
  }, []);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/admin/contest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        startTime: new Date(form.startTime),
        endTime: new Date(form.endTime),
        SelectedProblems:chosenProblems
      }),
    });

    const data = await res.json();
    if (data.ok) {
      //
    } else {
      alert("Failed to create contest");
    }
  };
  useEffect(()=>{if (search.trim() !== "") {
    setTimeout(()=>fetchProblem(),500);
   }},
   [search])
  useEffect(()=>{console.log(problems)},[problems])


  return user && user.uid ? (
  <div>
  {/* Contest creation form */}
  <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
      <input
        name="title"
        placeholder="Title"
        onChange={handleChange}
        required
        className="w-full border p-2"
      />
      <textarea
        name="description"
        placeholder="Description"
        onChange={handleChange}
        required
        className="w-full border p-2"
      />
      <input
        name="startTime"
        type="datetime-local"
        onChange={handleChange}
        required
        className="w-full border p-2"
      />
      <input
        name="endTime"
        type="datetime-local"
        onChange={handleChange}
        required
        className="w-full border p-2"
      />
    
  
     {/* Problem search section */}
     <div className="p-4 max-w-md mx-auto mt-6 bg-gray-50 border rounded">
      <h2 className="text-lg font-semibold mb-2">Add a Problem</h2>
      <input
        className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        name="problem_title"
        placeholder="Search by problem title"
        onChange={(e) => SetSearch(e.target.value)}
      />
  
      {/* List search results */}
      <ul className="mt-4 space-y-2">
        {problems.map((problem) => (
          <li
            key={problem.id}
            onClick={() => {
              if (!chosenProblems?.find(p => p.id === problem.id)) {
                SetChosenProblems([...chosenProblems, problem]);
              }
            }}
            className="p-2 bg-white border rounded hover:bg-gray-100 cursor-pointer"
          >
            {problem.title}
          </li>
        ))}
      </ul>
     </div>
  
     {/* Display selected problems */}
     <div className="p-4 max-w-md mx-auto mt-6 bg-white border rounded">
      <h3 className="text-lg font-semibold mb-2">Selected Challenges</h3>
      {chosenProblems?.length === 0 ? (
        <p className="text-gray-500">No Challenges selected yet.</p>
      ) : (
        <ul className="space-y-2">
          {chosenProblems?.map((problem) => (
            <li
              key={problem.id}
              className="p-2 flex justify-between items-center bg-gray-100 border rounded"
            >
              <span>{problem.title}</span>
              <button
                onClick={() =>
                  SetChosenProblems(chosenProblems.filter(p => p.id !== problem.id))
                }
                className="text-red-600 text-sm hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  
    {/* Submit button */}
    <div className="max-w-md mx-auto">
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded mt-5 w-full"
        onClick={()=>window.location.href='/contests'}
      >
        Create Contest
      </button>
    </div>
  </form>
</div>
) : <div></div>
  
}
