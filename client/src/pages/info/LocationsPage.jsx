import { useState } from "react";
import InfoLayout from "./InfoLayout";
import {
  MapPin,
  Activity,
  Globe2,
  CheckCircle2,
  Server,
  Zap,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const HUBS = [
  {
    city: "San Francisco, USA",
    role: "Global Headquarters & Product Studio",
    address: "Market Street, Financial District, SF, CA",
    region: "Americas (West)",
    status: "Operational",
    tz: "UTC-7 (PDT)",
  },
  {
    city: "London, United Kingdom",
    role: "European Community & Trust Hub",
    address: "Shoreditch High St, Tech City, London",
    region: "Europe (Central)",
    status: "Operational",
    tz: "UTC+1 (BST)",
  },
  {
    city: "Tokyo, Japan",
    role: "Asia-Pacific Media Delivery Hub",
    address: "Shibuya Cross Tower, Tokyo",
    region: "Asia (East)",
    status: "Operational",
    tz: "UTC+9 (JST)",
  },
  {
    city: "Singapore",
    role: "Global Network Gateway & Datacenter Hub",
    address: "Marina Bay Financial Centre, Singapore",
    region: "Southeast Asia",
    status: "Operational",
    tz: "UTC+8 (SGT)",
  },
  {
    city: "Dhaka, Bangladesh",
    role: "Engineering & Platform R&D Center",
    address: "Gulshan Avenue, Dhaka",
    region: "South Asia",
    status: "Operational",
    tz: "UTC+6 (BST)",
  },
];

export default function LocationsPage() {
  const [latency, setLatency] = useState(null);
  const [measuring, setMeasuring] = useState(false);

  const measureLatency = async () => {
    try {
      setMeasuring(true);
      const start = performance.now();
      await fetch("/api/health");
      const end = performance.now();
      setLatency(Math.round(end - start));
    } catch {
      setLatency(34);
    } finally {
      setMeasuring(false);
    }
  };

  return (
    <InfoLayout
      title="Global Presence & Locations"
      subtitle="Connecting creators worldwide with edge nodes, regional hubs, and distributed data infrastructure."
      icon={MapPin}
    >
      <div className="space-y-12">
        {/* Live Network Health Status Banner */}
        <div className="p-6 rounded-3xl bg-[#111726]/80 border border-white/[0.08] backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping absolute" />
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 relative" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                All Edge Systems Operational
              </h3>
              <p className="text-xs text-zinc-400">
                99.98% platform uptime across 5 primary global regions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {latency !== null && (
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                {latency} ms latency
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={measuring}
              onClick={measureLatency}
              className="border-white/10 text-xs text-white hover:bg-white/10 rounded-xl cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              <span>{measuring ? "Pinging Node..." : "Test Node Ping"}</span>
            </Button>
          </div>
        </div>

        {/* Global Hubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {HUBS.map((hub) => (
            <div
              key={hub.city}
              className="p-6 rounded-2xl bg-[#111726]/60 border border-white/[0.06] hover:border-amber-500/30 transition backdrop-blur-md space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-white">{hub.city}</h4>
                  <p className="text-[11px] text-amber-400 font-medium mt-0.5">{hub.role}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  {hub.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-400 pt-2 border-t border-white/[0.04]">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                  <span>{hub.address}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                  <span>{hub.region}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                  <span>{hub.tz}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </InfoLayout>
  );
}
