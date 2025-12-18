import { createFileRoute } from "@tanstack/react-router";
import { Activity, Network, Globe, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "../../lib/app-client";
import { authClient } from "../../lib/auth-client";

export const Route = createFileRoute("/dash/")({
  component: OverviewView,
});

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) {
    return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  } else if (bytes >= 1_048_576) {
    return `${(bytes / 1_048_576).toFixed(1)} MB`;
  } else if (bytes >= 1_024) {
    return `${(bytes / 1_024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
}

function OverviewView() {
  const { data: activeOrganization } = useQuery({
    queryKey: ["activeOrganization"],
    queryFn: async () => {
      const session = await authClient.getSession();
      return session.data?.session.activeOrganizationId || null;
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats", "overview", activeOrganization],
    queryFn: async () => {
      if (!activeOrganization) return null;
      const result = await appClient.stats.overview(activeOrganization);
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    enabled: !!activeOrganization,
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-gray-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OverviewCard
          title="Total Requests"
          value={formatNumber(stats?.totalRequests || 0)}
          change={
            stats?.requestsChange
              ? `${stats.requestsChange > 0 ? "+" : ""}${stats.requestsChange}%`
              : "—"
          }
          isPositive={stats?.requestsChange ? stats.requestsChange >= 0 : true}
          icon={<Activity size={20} />}
        />
        <OverviewCard
          title="Active Tunnels"
          value={(stats?.activeTunnels ?? 0).toString()}
          change={
            stats?.activeTunnelsChange
              ? `${stats.activeTunnelsChange > 0 ? "+" : ""}${stats.activeTunnelsChange}`
              : "—"
          }
          isPositive={
            stats?.activeTunnelsChange ? stats.activeTunnelsChange >= 0 : true
          }
          icon={<Network size={20} />}
        />
        <OverviewCard
          title="Data Transfer"
          value={formatBytes(stats?.totalDataTransfer || 0)}
          change={
            stats?.dataTransferChange
              ? `${stats.dataTransferChange > 0 ? "+" : ""}${stats.dataTransferChange}%`
              : "—"
          }
          isPositive={
            stats?.dataTransferChange ? stats.dataTransferChange >= 0 : true
          }
          icon={<Globe size={20} />}
        />
      </div>

      <div className="bg-black border border-white/5 rounded-lg p-6 h-96 flex items-center justify-center text-gray-500">
        Chart Placeholder
      </div>
    </div>
  );
}

function OverviewCard({
  title,
  value,
  change,
  icon,
  isPositive = true,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  isPositive?: boolean;
}) {
  const changeColor = isPositive
    ? "text-green-400 bg-green-500/10 border-green-500/20"
    : "text-red-400 bg-red-500/10 border-red-500/20";

  return (
    <div className="group bg-black border border-white/5 rounded-lg p-4 hover:border-white/10 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
          {icon}
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${changeColor}`}
        >
          {change}
        </span>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
        {title}
      </div>
    </div>
  );
}
