import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ResumePreview from "../components/resume/ResumePreview";
import {
  generateAIResume,
  getGeneratedResume,
} from "../api";

export default function ResumeBuilder() {

  const [loading,setLoading]=useState(false);

  const [resume,setResume]=useState<any>(null);

  const [targetRole,setTargetRole]=useState(
    "Senior Python Backend Engineer"
  );

  useEffect(()=>{
      loadResume();
  },[]);

  async function loadResume(){

      try{

          const data=await getGeneratedResume();

          setResume(data);

      }catch{}
  }

  async function generate(){

      setLoading(true);

      try{

          await generateAIResume(
              1,
              targetRole
          );

          toast.success("AI Resume Generated");

          loadResume();

      }catch(e){

          toast.error("Generation failed");

      }

      setLoading(false);

  }

  return(

<div className="max-w-6xl mx-auto">

<div className="flex justify-between items-center mb-8">

<div>

<h1 className="text-3xl font-bold">

AI Resume Builder

</h1>

<p className="text-gray-500">

Generate ATS Optimized Resume

</p>

</div>

<button

onClick={generate}

className="bg-indigo-600 text-white px-6 py-3 rounded-lg"

>

{

loading

?

"Generating..."

:

"Generate Resume"

}

</button>

</div>

<div className="mb-6">

<label className="font-semibold">

Target Role

</label>

<input

value={targetRole}

onChange={(e)=>setTargetRole(e.target.value)}

className="input mt-2"

/>

</div>

{
  resume && (
    <ResumePreview
      resume={resume}
    />
  )
}

</div>

);

}