import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReadinessCircle from "../components/application/ReadinessCircle";
import Checklist from "../components/application/Checklist";
import ProgressBar from "../components/application/ProgressBar";
import EmailCard from "../components/application/EmailCard";
import SuggestionCard from "../components/application/SuggestionCard";
import {
    getJobs,
    generateApplicationAssistant,
    getApplicationAssistant,
} from "../api";

export default function ApplicationAssistant() {

    const [jobs, setJobs] = useState<any[]>([]);
    const [data, setData] = useState<any[]>([]);
    const [jobId, setJobId] = useState<number>();

    useEffect(() => {
        load();
    }, []);

   async function load() {

    try {

        const [j, h] = await Promise.all([
            getJobs(),
            getApplicationAssistant(),
        ]);

        setJobs(j);
        setData(h);

    } catch {

        toast.error("Unable to load data");

    }

}

   async function generate() {

    if (!jobId) {
        toast.error("Select Job");
        return;
    }

    try {

        await generateApplicationAssistant(jobId);

        toast.success("Application Assistant Generated");

        load();

    } catch {

        toast.error("Something went wrong");

    }

}

    return (

        <div className="max-w-6xl mx-auto">

            <h1 className="text-3xl font-bold mb-8">
                AI Application Assistant
            </h1>

            <div className="flex gap-4">

                <select
                    className="input"
                    onChange={(e) =>
                        setJobId(Number(e.target.value))
                    }
                >

                    <option>Select Job</option>

                    {jobs.map(j => (

                        <option
                            key={j.id}
                            value={j.id}
                        >
                            {j.job_title}
                        </option>

                    ))}

                </select>

                <button
                    onClick={generate}
                    className="btn btn-primary"
                >
                    Analyze
                </button>

            </div>

            <div className="mt-10 space-y-5">

              <div className="mt-10 space-y-8">

  {data.map((d: any) => (

    <div
      key={d.id}
      className="bg-white rounded-xl shadow-lg p-8"
    >

      <div className="grid lg:grid-cols-2 gap-10">

        {/* LEFT */}

        <div>

          <ReadinessCircle score={d.readiness_score} />

          <div className="mt-8">
            <ProgressBar score={d.readiness_score} />
          </div>

          <div className="mt-8 space-y-5">

            <div>
              <div className="text-sm text-gray-500">
                Next Action
              </div>

              <div className="text-xl font-bold text-indigo-600">
                {d.next_action}
              </div>
            </div>

            <div>

              <div className="text-sm text-gray-500">
                Priority
              </div>

              <span
                className={`inline-block mt-2 px-4 py-2 rounded-full text-white font-semibold ${
                  d.priority === "High"
                    ? "bg-red-600"
                    : d.priority === "Medium"
                    ? "bg-yellow-500"
                    : "bg-green-600"
                }`}
              >
                {d.priority}
              </span>

            </div>

            <div>

              <div className="text-sm text-gray-500">
                Notification
              </div>

              <p className="mt-2 text-gray-700">
                {d.notification}
              </p>

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div>

          <Checklist
            score={d.readiness_score}
          />

        </div>

      </div>

      {/* EMAILS */}

      <div className="grid lg:grid-cols-3 gap-6 mt-10">

        <EmailCard
          title="Application Email"
          text={d.email}
        />

        <EmailCard
          title="LinkedIn Message"
          text={d.linkedin_message}
        />

        <EmailCard
          title="Follow-up Email"
          text={d.followup_email}
        />

      </div>

      {/* SUGGESTIONS */}

      <div className="mt-8">

        <SuggestionCard
          items={d.suggestions}
        />

      </div>

    </div>

  ))}

</div>

            </div>

        </div>

    );

}



