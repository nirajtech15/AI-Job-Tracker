import { useState } from "react";
import toast from "react-hot-toast";

import { uploadResume, analyzeResume } from "../api";

import ResumeUpload from "../components/resume/ResumeUpload";
import ResumePreview from "../components/resume/ResumePreview";
import ResumeAnalyzer from "../components/resume/ResumeAnalyzer";
import ATSScoreCard from "../components/resume/ATSScoreCard";
import SkillList from "../components/resume/SkillList";
import SuggestionCard from "../components/resume/SuggestionCard";
import Loading from "../components/resume/Loading";
import ResumeSummary from "../components/resume/ResumeSummary";
import JDKeywords from "../components/resume/JDKeywords";
import ATSGauge from "../components/resume/ATSGauge";

export default function Resume() {

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [resume, setResume] = useState<any>(null);

  const [analysis, setAnalysis] = useState<any>(null);

  const [jobDescription, setJobDescription] = useState("");

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {

    if (!e.target.files?.length) return;

    const file = e.target.files[0];

    setLoading(true);

    try {

      const data = await uploadResume(file);

      setResume(data);

      toast.success("Resume uploaded successfully");

    } catch (err) {

      console.error(err);

      toast.error("Upload failed");

    }

    setLoading(false);

  }

  async function handleAnalyze() {

    if (!resume) {

      toast.error("Upload Resume First");

      return;

    }

    if (!jobDescription.trim()) {

      toast.error("Paste Job Description");

      return;

    }

    setAnalyzing(true);

    try {

      const res = await analyzeResume(
        resume.id,
        jobDescription
      );

      setAnalysis(res.data);

      toast.success("Analysis Completed");

    } catch (err) {

      console.error(err);

      toast.error("Analysis Failed");

    }

    setAnalyzing(false);

  }

  return (

    <div className="max-w-7xl mx-auto space-y-8">

      <div>

        <h1 className="text-4xl font-bold">

          AI Resume Analyzer

        </h1>

        <p className="text-gray-500 mt-2">

          Upload Resume → Paste Job Description → Get ATS Score

        </p>

      </div>

      <ResumeUpload
        loading={loading}
        onUpload={handleUpload}
      />

      {resume && (

        <ResumePreview
          resume={resume}
        />

      )}

      {resume && (

        <ResumeAnalyzer
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          loading={analyzing}
          onAnalyze={handleAnalyze}
        />

      )}

      {analyzing && (

        <Loading />

      )}

      {analysis && (

        <>
        <ATSGauge
        score={analysis.ats_score}
        />
          <ATSScoreCard
            analysis={analysis}
          />
            <ResumeSummary
            analysis={analysis}
            />

            <JDKeywords
            keywords={analysis.jd_keywords}
            />
          <div className="grid lg:grid-cols-2 gap-6">

            <SkillList
              title="Matching Skills"
              skills={analysis.matching_skills}
              color="bg-green-600"
            />

            <SkillList
              title="Missing Skills"
              skills={analysis.missing_skills}
              color="bg-red-600"
            />

          </div>

          <div className="grid lg:grid-cols-2 gap-6">

            <SuggestionCard
              suggestions={analysis.strengths}
            />

            <SuggestionCard
              suggestions={analysis.weaknesses}
            />

          </div>

          <SuggestionCard
            suggestions={analysis.suggestions}
          />

        </>

      )}

    </div>

  );

}