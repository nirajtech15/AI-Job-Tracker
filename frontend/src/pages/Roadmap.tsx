import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  generateRoadmap,
  getRoadmap,
} from "../api";

export default function Roadmap() {

  const [loading,setLoading]=useState(false);

  const [items,setItems]=useState<any[]>([]);

  useEffect(()=>{
      loadRoadmap();
  },[]);

  async function loadRoadmap(){

      try{

          const data=await getRoadmap();

          setItems(data);

      }catch{}
  }

  async function generate(){

      setLoading(true);

      try{

          await generateRoadmap(
              1,
              "Senior Python Backend Engineer"
          );

          toast.success("Roadmap Generated");

          loadRoadmap();

      }catch{

          toast.error("Generation Failed");

      }

      setLoading(false);

  }

  return(

      <div className="max-w-6xl mx-auto">

          <div className="flex justify-between items-center mb-8">

              <div>

                  <h1 className="text-3xl font-bold">

                      AI Career Roadmap

                  </h1>

                  <p className="text-gray-500">

                      Personalized learning roadmap

                  </p>

              </div>

              <button
                  onClick={generate}
                  className="bg-indigo-600 text-white px-5 py-3 rounded-lg"
              >

                  {loading
                  ? "Generating..."
                  :"Generate Roadmap"}

              </button>

          </div>

          <div className="grid md:grid-cols-2 gap-6">

              {items.map(item=>(

                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow p-6 border"
                  >

                      <div className="flex justify-between">

                          <h2 className="font-bold text-xl">

                              Week {item.week}

                          </h2>

                          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">

                              {item.completed
                              ?"Completed"
                              :"Pending"}

                          </span>

                      </div>

                      <h3 className="mt-5 text-lg font-semibold">

                          {item.title}

                      </h3>

                      <p className="mt-3 text-gray-600">

                          {item.description}

                      </p>

                      <div className="mt-5">

                          <div className="font-semibold">

                              Resource

                          </div>

                          <div className="text-indigo-600">

                              {item.resource}

                          </div>

                      </div>

                      <div className="mt-4">

                          <div className="font-semibold">

                              Project

                          </div>

                          <div>

                              {item.project}

                          </div>

                      </div>

                  </div>

              ))}

          </div>

      </div>

  );

}