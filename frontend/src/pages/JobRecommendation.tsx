import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  generateJobRecommendation,
  getJobRecommendations,
  getJobs,
  getResumes,
} from "../api";

interface Job {
  id: number;
  job_title: string;
}

interface Resume {
  id: number;
  file_name: string;
}

interface Recommendation {
  id: number;
  match_score: number;
  recommendation: string;
  priority: string;
}

export default function JobRecommendation() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [results, setResults] = useState<Recommendation[]>([]);

  const [jobId, setJobId] = useState<number | null>(null);
  const [resumeId, setResumeId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [jobData, resumeData, recommendationData] = await Promise.all([
        getJobs(),
        getResumes(),
        getJobRecommendations(),
      ]);

      setJobs(jobData ?? []);
      setResumes(resumeData ?? []);
      setResults(recommendationData ?? []);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load data");
    }
  }

  async function analyze() {
    if (!jobId || !resumeId) {
      toast.error("Please select Resume and Job");
      return;
    }

    try {
      await generateJobRecommendation(jobId, resumeId);

      toast.success("Recommendation Generated");

      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Generation Failed");
    }
  }

  return (
    <div className="max-w-6xl mx-auto">

      <h1 className="text-3xl font-bold mb-8">
        AI Job Recommendation
      </h1>

      <div className="grid md:grid-cols-2 gap-6">

        <select
          className="border rounded-lg p-3"
          defaultValue=""
          onChange={(e) => setResumeId(Number(e.target.value))}
        >
          <option value="">Select Resume</option>

          {resumes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.file_name}
            </option>
          ))}
        </select>

        <select
          className="border rounded-lg p-3"
          defaultValue=""
          onChange={(e) => setJobId(Number(e.target.value))}
        >
          <option value="">Select Job</option>

          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.job_title}
            </option>
          ))}
        </select>

      </div>

      <button
        onClick={analyze}
        className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
      >
        Analyze Match
      </button>

      <div className="mt-10 space-y-6">

        {results.length === 0 && (
          <div className="text-gray-500">
            No recommendations generated yet.
          </div>
        )}

        {results.map((item) => (

          <div
            key={item.id}
            className="border rounded-xl p-6 shadow-sm bg-white"
          >

            <div className="flex justify-between items-center">

              <h2 className="text-xl font-semibold">
                Match Score
              </h2>

              <span className="text-3xl font-bold text-green-600">
                {item.match_score}%
              </span>

            </div>

            <div className="mt-5 space-y-2">

              <p>
                <strong>Recommendation:</strong>{" "}
                {item.recommendation}
              </p>

              <p>
                <strong>Priority:</strong>{" "}
                <span
                  className={`font-semibold ${
                    item.priority === "High"
                      ? "text-red-600"
                      : item.priority === "Medium"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {item.priority}
                </span>
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}