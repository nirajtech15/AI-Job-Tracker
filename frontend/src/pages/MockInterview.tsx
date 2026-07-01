import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getQA,
  evaluateInterview,
} from "../api";

import type {
  QAItem,
  InterviewEvaluation,
} from "../types";

import QuestionCard from "../components/interview/QuestionCard";
import AnswerBox from "../components/interview/AnswerBox";
import EvaluationCard from "../components/interview/EvaluationCard";

export default function MockInterview() {
  const [questions, setQuestions] = useState<QAItem[]>([]);
  const [current, setCurrent] = useState(0);

  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(false);

  const [evaluation, setEvaluation] =
    useState<InterviewEvaluation | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    try {

      // Temporary Job ID
      const res = await getQA(1);

      setQuestions(res.qa_list);

    } catch {

      toast.error("Generate Interview Questions first.");

    }
  }

  async function submitAnswer() {

    if (!answer.trim()) {
      toast.error("Answer required");
      return;
    }

    setLoading(true);

    try {

      const qa = questions[current];

      const result = await evaluateInterview(
        qa.id,
        answer
      );

      setEvaluation(result);

      toast.success("Answer evaluated");

    } catch {

      toast.error("Evaluation failed");

    }

    setLoading(false);
  }

  function nextQuestion() {

    if (current === questions.length - 1) {

      toast.success("Interview Completed");

      return;

    }

    setCurrent(current + 1);

    setAnswer("");

    setEvaluation(null);

  }

  if (!questions.length) {

    return (

      <div className="card p-10">

        <h2 className="text-xl font-bold">

          No Interview Questions

        </h2>

        <p className="text-gray-500 mt-2">

          Generate interview questions first.

        </p>

      </div>

    );

  }

  return (

    <div className="max-w-5xl mx-auto space-y-6">

      <h1 className="text-3xl font-bold">

        AI Mock Interview

      </h1>

      <div className="text-sm text-gray-500">

        Question {current + 1} / {questions.length}

      </div>

      <QuestionCard
        question={questions[current].question}
        type={questions[current].type}
      />

      <AnswerBox
        value={answer}
        onChange={setAnswer}
        loading={loading}
        onSubmit={submitAnswer}
      />

      {evaluation && (

        <EvaluationCard
          data={evaluation}
          onNext={nextQuestion}
          isLast={
            current === questions.length - 1
          }
        />

      )}

    </div>

  );

}