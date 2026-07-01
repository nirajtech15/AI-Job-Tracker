import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  careerChat,
  careerHistory,
  clearCareerHistory,
} from "../api";

import type { CareerChat as ChatType } from "../types";

import ChatBubble from "../components/career/ChatBubble";
import ChatInput from "../components/career/ChatInput";
import ThinkingLoader from "../components/career/ThinkingLoader";

import {
  Bot,
  Trash2,
  Sparkles,
  Briefcase,
  GraduationCap,
  TrendingUp,
} from "lucide-react";

export default function CareerCoach() {
  const [messages, setMessages] = useState<ChatType[]>([]);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function loadHistory() {
    try {
      const data = await careerHistory();
      setMessages(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function send(message: string) {
    if (!message.trim()) return;

    const userMessage: ChatType = {
      role: "user",
      message,
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
      const res = await careerChat(message);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          message: res.answer,
        },
      ]);
    } catch (e) {
      toast.error("AI failed.");
    }

    setLoading(false);
  }

  async function clearChat() {
    await clearCareerHistory();
    setMessages([]);
    toast.success("Chat cleared");
  }

  function quickAsk(text: string) {
    send(text);
  }

  return (
    <div className="max-w-6xl mx-auto">

      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-3xl font-bold flex items-center gap-3">

            <Bot className="text-indigo-600" />

            AI Career Coach

          </h1>

          <p className="text-gray-500 mt-2">

            Ask anything about your career,
            resume,
            salary,
            interviews,
            roadmap.

          </p>

        </div>

        <button
          onClick={clearChat}
          className="btn-secondary flex items-center gap-2"
        >
          <Trash2 size={18} />

          Clear
        </button>

      </div>

      {/* Quick Actions */}

      <div className="grid md:grid-cols-4 gap-4 mb-6">

        <button
          onClick={() =>
            quickAsk("Review my resume.")
          }
          className="card p-5 hover:shadow-lg"
        >
          <Sparkles />

          <div className="mt-3 font-semibold">

            Resume Review

          </div>

        </button>

        <button
          onClick={() =>
            quickAsk("Create 30 days roadmap.")
          }
          className="card p-5 hover:shadow-lg"
        >
          <GraduationCap />

          <div className="mt-3 font-semibold">

            Learning Roadmap

          </div>

        </button>

        <button
          onClick={() =>
            quickAsk("How can I reach 30 LPA?")
          }
          className="card p-5 hover:shadow-lg"
        >
          <TrendingUp />

          <div className="mt-3 font-semibold">

            Salary Advice

          </div>

        </button>

        <button
          onClick={() =>
            quickAsk("Prepare me for interviews.")
          }
          className="card p-5 hover:shadow-lg"
        >
          <Briefcase />

          <div className="mt-3 font-semibold">

            Interview Prep

          </div>

        </button>

      </div>

      {/* Chat */}

      <div className="card h-[600px] flex flex-col">

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {messages.length === 0 && (

            <div className="text-center mt-20">

              <Bot
                size={70}
                className="mx-auto text-indigo-600"
              />

              <h2 className="font-bold text-2xl mt-5">

                AI Career Coach

              </h2>

              <p className="text-gray-500 mt-2">

                Start a conversation...

              </p>

            </div>

          )}

          {messages.map((m, i) => (

            <ChatBubble
              key={i}
              role={m.role}
              message={m.message}
            />

          ))}

          {loading && <ThinkingLoader />}

          <div ref={bottomRef} />

        </div>

        <ChatInput onSend={send} />

      </div>

    </div>
  );
}