import { useState } from "react";
import InfoLayout from "./InfoLayout";
import {
  Code,
  Terminal,
  Play,
  Copy,
  Check,
  Zap,
  Globe,
  Lock,
  Layers,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/axios";

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/v1/search?limit=3",
    desc: "Search public community users, trending reels, and hashtags",
    auth: "Public",
    samplePayload: null,
  },
  {
    method: "GET",
    path: "/api/v1/post/reels",
    desc: "Fetch vertical reels feed with author profiles and video stream URLs",
    auth: "Public",
    samplePayload: null,
  },
  {
    method: "GET",
    path: "/api/v1/user/allUsers",
    desc: "Retrieve platform community directory with verified blue tags",
    auth: "Public",
    samplePayload: null,
  },
  {
    method: "POST",
    path: "/api/v1/user/forgot-password",
    desc: "Trigger password reset token and 6-digit OTP code dispatch via Nodemailer",
    auth: "Public",
    samplePayload: { email: "user@example.com" },
  },
];

export default function ApiDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [activeLang, setActiveLang] = useState("curl");
  const [copied, setCopied] = useState(false);

  const runTest = async () => {
    try {
      setTesting(true);
      setTestResult(null);

      // Clean path to relative
      const cleanPath = selectedEndpoint.path.replace("/api/v1", "");
      let res;
      if (selectedEndpoint.method === "GET") {
        res = await axiosInstance.get(cleanPath, { withCredentials: true });
      } else {
        res = await axiosInstance.post(
          cleanPath,
          selectedEndpoint.samplePayload || {},
          { withCredentials: true }
        );
      }

      setTestResult({
        status: res.status,
        data: res.data,
      });
      toast.success("Live API response received!");
    } catch (err) {
      setTestResult({
        status: err.response?.status || 500,
        data: err.response?.data || { error: err.message },
      });
      toast.info("API responded with status code");
    } finally {
      setTesting(false);
    }
  };

  const getCodeSnippet = () => {
    const fullUrl = `${window.location.origin}${selectedEndpoint.path}`;
    if (activeLang === "curl") {
      if (selectedEndpoint.method === "GET") {
        return `curl -X GET "${fullUrl}" \\
  -H "Accept: application/json"`;
      }
      return `curl -X POST "${fullUrl}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(selectedEndpoint.samplePayload || {}, null, 2)}'`;
    }

    if (activeLang === "javascript") {
      return `import axios from "axios";

const response = await axios({
  method: "${selectedEndpoint.method.toLowerCase()}",
  url: "${fullUrl}",
  ${
    selectedEndpoint.samplePayload
      ? `data: ${JSON.stringify(selectedEndpoint.samplePayload, null, 2)},`
      : ""
  }
  withCredentials: true
});

console.log(response.data);`;
    }

    if (activeLang === "python") {
      return `import requests

url = "${fullUrl}"
headers = {"Content-Type": "application/json"}
${
  selectedEndpoint.samplePayload
    ? `payload = ${JSON.stringify(selectedEndpoint.samplePayload)}
res = requests.post(url, json=payload, headers=headers)`
    : `res = requests.get(url, headers=headers)`
}

print(res.json())`;
    }
    return "";
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    toast.success("Code snippet copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <InfoLayout
      title="Net-ly Developer API Hub"
      subtitle="Build third-party integrations, bots, client applications, and real-time social experiences using the Net-ly API."
      icon={Code}
    >
      <div className="space-y-12">
        {/* API Architecture Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#111726]/60 border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Globe className="w-4 h-4" />
              <span>RESTful Architecture</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Standard JSON payloads, predictable HTTP verbs, standard error codes, and pagination parameters.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#111726]/60 border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <Zap className="w-4 h-4" />
              <span>Socket.io Real-Time</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Bi-directional WebSocket event channels for live message delivery, typing states, and notifications.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#111726]/60 border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Lock className="w-4 h-4" />
              <span>JWT & Secure Cookies</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              State-of-the-art tokenized authentication with SameSite protections and role-based permissions.
            </p>
          </div>
        </div>

        {/* Live Interactive Endpoint Explorer & Sandbox */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#111726]/80 border border-white/[0.08] shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-400" />
                Live API Playground & Console
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Select an endpoint below to inspect syntax or execute an instant live query.
              </p>
            </div>

            <button
              type="button"
              disabled={testing}
              onClick={runTest}
              className="px-5 py-2.5 rounded-xl bg-[#FACE25] hover:bg-[#eab308] text-zinc-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/10"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-zinc-950" />
                  <span>Run Live Request</span>
                </>
              )}
            </button>
          </div>

          {/* Endpoint Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.path === ep.path;
              return (
                <div
                  key={ep.path}
                  onClick={() => {
                    setSelectedEndpoint(ep);
                    setTestResult(null);
                  }}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-white/[0.08] border-amber-400/50 shadow-md"
                      : "bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1] text-zinc-400"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          ep.method === "GET"
                            ? "bg-sky-500/20 text-sky-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono text-zinc-200 truncate">{ep.path}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1 truncate">{ep.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Code Snippet & Live Console Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Code Snippet */}
            <div className="bg-black/60 rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col">
              <div className="p-3 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {["curl", "javascript", "python"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLang(lang)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition capitalize cursor-pointer ${
                        activeLang === lang
                          ? "bg-amber-400 text-zinc-950 font-bold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="text-zinc-400 hover:text-white p-1 rounded transition"
                  title="Copy code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <pre className="p-4 font-mono text-[11px] text-zinc-300 overflow-x-auto flex-1 leading-relaxed">
                <code>{getCodeSnippet()}</code>
              </pre>
            </div>

            {/* Live Response Output */}
            <div className="bg-black/60 rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col min-h-[220px]">
              <div className="p-3 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                  Live Response
                </span>
                {testResult && (
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      testResult.status >= 200 && testResult.status < 300
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    HTTP {testResult.status}
                  </span>
                )}
              </div>

              <div className="p-4 overflow-x-auto flex-1 font-mono text-[11px]">
                {testResult ? (
                  <pre className="text-emerald-400 leading-relaxed">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-600 text-xs">
                    Click &ldquo;Run Live Request&rdquo; to test this endpoint
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </InfoLayout>
  );
}
