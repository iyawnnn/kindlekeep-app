import { useState } from "react";
import { Activity, Shield, Globe, Power, Trash2, RotateCcw, Pencil } from "lucide-react";
import { AlertDialog, Button, Flex } from "@radix-ui/themes";
import {
  type MonitorResponse,
  UptimeStatus,
  useMonitorStore,
} from "../store/useMonitorStore";
import { KindleCard } from "../../../components/ui/KindleCard";
import { useToastStore } from "../../../components/ui/useToastStore";
import { SecurityDetailsModal } from "./SecurityDetailsModal";
import { EditMonitorModal } from "./EditMonitorModal";

interface MonitorCardProps {
  monitor: MonitorResponse;
}

export const MonitorCard = ({ monitor }: MonitorCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toggleMonitor, deleteMonitor, resetCircuit } = useMonitorStore();

  const isQuarantined = monitor.currentUptimeStatus === UptimeStatus.Quarantined;

  const statusColorClass = isQuarantined
    ? "text-red-600 font-unbounded"
    : !monitor.isActive
      ? "text-zinc-500"
      : monitor.currentUptimeStatus === UptimeStatus.Healthy
        ? "text-blue-600"
        : monitor.currentUptimeStatus === UptimeStatus.Down
          ? "text-red-600"
          : "text-amber-600"; // Degraded

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMonitor(monitor.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditOpen(true);
  };

  const handleReset = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResetting(true);
    try {
      await resetCircuit(monitor.id);
      useToastStore.getState().success(`Circuit reset for ${monitor.friendlyName}.`);
    } catch {
      useToastStore.getState().error(`Failed to reset circuit for ${monitor.friendlyName}.`);
    } finally {
      setIsResetting(false);
    }
  };

  const confirmDelete = () => {
    deleteMonitor(monitor.id);
  };

  return (
    <>
      <div
        onClick={() => !isQuarantined && setIsModalOpen(true)}
        className={`cursor-pointer h-full transition-all duration-300 ${
          !monitor.isActive || isQuarantined ? "opacity-40" : ""
        } ${isQuarantined ? "grayscale" : ""}`}
      >
        <KindleCard
          isActive={monitor.isActive && !isQuarantined}
          className={isQuarantined ? "border-zinc-300 !animate-none" : ""}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe
                strokeWidth={1}
                className={`w-5 h-5 ${monitor.isActive && !isQuarantined ? "text-blue-500" : "text-zinc-400"}`}
              />
              <h3 className="font-heading font-bold text-sm truncate w-48 text-zinc-900">
                {monitor.friendlyName}
              </h3>
            </div>
            <span className={`text-xs uppercase tracking-widest font-bold font-sans ${statusColorClass}`}>
              {isQuarantined
                ? "QUARANTINED"
                : monitor.isActive
                  ? UptimeStatus[monitor.currentUptimeStatus]
                  : "Hibernating"}
            </span>
          </div>

          <p className="text-xs text-zinc-500 font-mono mb-6 truncate">
            {monitor.url}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-4 text-zinc-700">
              <div className="flex items-center gap-2">
                <Activity strokeWidth={1} className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-mono">
                  {monitor.latencyMs != null && monitor.isActive && !isQuarantined
                    ? `${monitor.latencyMs}ms`
                    : "---"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield strokeWidth={1} className="w-4 h-4 text-zinc-400" />
                <span
                  className={`text-sm font-bold font-mono ${
                    monitor.currentSecurityGrade === "A" && monitor.isActive && !isQuarantined
                      ? "text-blue-600"
                      : "text-zinc-900"
                  }`}
                >
                  {monitor.isActive && !isQuarantined ? monitor.currentSecurityGrade : "U"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isQuarantined && (
                <Button
                  size="1"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isResetting}
                  className="bg-white border-zinc-300 text-zinc-500 hover:text-zinc-900 font-onest rounded-none h-7 px-2 cursor-pointer transition-colors flex items-center gap-1"
                >
                  <RotateCcw size={12} className={isResetting ? "animate-spin" : ""} />
                  {isResetting ? "Resetting..." : "Reset Circuit"}
                </Button>
              )}

              {!isQuarantined && (
                <button
                  onClick={handleToggle}
                  className="text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  <Power size={16} />
                </button>
              )}

              <button
                onClick={handleEdit}
                className="text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <Pencil size={16} />
              </button>

              <AlertDialog.Root>
                <AlertDialog.Trigger>
                  <button
                    onClick={handleDelete}
                    className="text-zinc-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </AlertDialog.Trigger>
                <AlertDialog.Content
                  className="bg-white border border-zinc-200"
                  style={{ borderRadius: 0 }}
                  maxWidth="450px"
                >
                  <AlertDialog.Title className="text-zinc-900 font-unbounded font-bold">
                    Delete Monitor
                  </AlertDialog.Title>
                  <AlertDialog.Description
                    size="2"
                    className="text-zinc-600 font-onest mb-4"
                  >
                    Are you sure you want to delete{" "}
                    <strong>{monitor.friendlyName}</strong>? All telemetry logs
                    and security audits associated with this monitor will be
                    permanently removed.
                  </AlertDialog.Description>

                  <Flex gap="3" justify="end">
                    <AlertDialog.Cancel>
                      <Button
                        variant="soft"
                        className="bg-zinc-100 text-zinc-900 font-onest cursor-pointer"
                        style={{ borderRadius: 0 }}
                      >
                        Cancel
                      </Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action>
                      <Button
                        variant="solid"
                        color="red"
                        className="bg-red-600 text-white font-onest cursor-pointer"
                        style={{ borderRadius: 0 }}
                        onClick={confirmDelete}
                      >
                        Delete
                      </Button>
                    </AlertDialog.Action>
                  </Flex>
                </AlertDialog.Content>
              </AlertDialog.Root>
            </div>
          </div>
        </KindleCard>
      </div>

      {monitor.isActive && !isQuarantined && (
        <SecurityDetailsModal
          monitorId={monitor.id}
          grade={monitor.currentSecurityGrade}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}

      <EditMonitorModal
        monitorId={monitor.id}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  );
};
