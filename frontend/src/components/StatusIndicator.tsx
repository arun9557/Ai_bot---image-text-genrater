interface StatusIndicatorProps {
  status: "online" | "busy" | "away";
  className?: string;
}

export function StatusIndicator({ status, className = "" }: StatusIndicatorProps) {
  const statusConfig = {
    online: {
      color: "bg-secondary",
      label: "Online"
    },
    busy: {
      color: "bg-accent",
      label: "Busy"
    },
    away: {
      color: "bg-muted-foreground",
      label: "Away"
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
      <span className="text-xs font-montserrat text-muted-foreground">{config.label}</span>
    </div>
  );
}