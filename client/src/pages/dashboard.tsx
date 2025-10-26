import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Upload as UploadIcon, TrendingUp, AlertCircle } from "lucide-react";
import type { Upload } from "@shared/schema";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: uploads, isLoading } = useQuery<Upload[]>({
    queryKey: ["/api/uploads"],
  });

  const stats = {
    total: uploads?.length || 0,
    successful: uploads?.filter(u => u.status === "success").length || 0,
    failed: uploads?.filter(u => u.status === "failed").length || 0,
    processing: uploads?.filter(u => u.status === "processing" || u.status === "pending").length || 0,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-600" data-testid="icon-success" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" data-testid="icon-failed" />;
      case "processing":
      case "pending":
        return <Clock className="w-5 h-5 text-amber-600 animate-spin" data-testid="icon-processing" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive", label: string }> = {
      success: { variant: "default", label: "Success" },
      failed: { variant: "destructive", label: "Failed" },
      processing: { variant: "secondary", label: "Processing" },
      pending: { variant: "secondary", label: "Pending" },
    };
    const config = variants[status] || { variant: "secondary" as const, label: status };
    return (
      <Badge variant={config.variant} className="gap-1.5" data-testid={`badge-status-${status}`}>
        {getStatusIcon(status)}
        <span>{config.label}</span>
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="heading-dashboard">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor your video upload activity and performance metrics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6" data-testid="card-stat-total">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <UploadIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Uploads</p>
                <p className="text-3xl font-bold text-foreground" data-testid="text-total-uploads">
                  {stats.total}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6" data-testid="card-stat-successful">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-3xl font-bold text-foreground" data-testid="text-successful-uploads">
                  {stats.successful}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6" data-testid="card-stat-failed">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/10">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-3xl font-bold text-foreground" data-testid="text-failed-uploads">
                  {stats.failed}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6" data-testid="card-stat-processing">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-3xl font-bold text-foreground" data-testid="text-processing-uploads">
                  {stats.processing}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Upload History */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-card-border">
            <h2 className="text-xl font-semibold text-foreground" data-testid="heading-upload-history">
              Upload History
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <Clock className="w-12 h-12 text-muted-foreground animate-spin mb-4" />
              <p className="text-muted-foreground">Loading uploads...</p>
            </div>
          ) : !uploads || uploads.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center" data-testid="empty-state">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <UploadIcon className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No uploads yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                Start uploading videos by sending POST requests to the upload endpoint
              </p>
              <code className="px-4 py-2 rounded-md bg-muted text-sm font-mono text-muted-foreground">
                POST /api/upload
              </code>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="table-uploads">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Uploaded At</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Media ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {uploads.map((upload) => (
                    <tr
                      key={upload.id}
                      className="hover-elevate"
                      data-testid={`row-upload-${upload.id}`}
                    >
                      <td className="px-6 py-4">
                        {getStatusBadge(upload.status)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground" data-testid={`text-title-${upload.id}`}>
                          {upload.title}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground max-w-md truncate" data-testid={`text-description-${upload.id}`}>
                          {upload.description || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground" data-testid={`text-date-${upload.id}`}>
                          {format(new Date(upload.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {upload.mediaId ? (
                          <code className="px-2 py-1 rounded bg-muted text-xs font-mono text-foreground" data-testid={`text-media-id-${upload.id}`}>
                            {upload.mediaId}
                          </code>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
