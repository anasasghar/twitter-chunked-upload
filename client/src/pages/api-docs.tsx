import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, Code2, Send, Upload, Key, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function ApiDocs() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const uploadExample = `curl -X POST ${baseUrl}/api/upload \\
  -F "video=@video.mp4" \\
  -F "title=My Awesome Video" \\
  -F "description=Check out this amazing video!"`;

  const uploadResponseSuccess = `{
  "success": true,
  "upload": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "My Awesome Video",
    "description": "Check out this amazing video!",
    "status": "processing",
    "mediaId": "1880028106020515840",
    "createdAt": "2025-01-26T10:30:00Z"
  },
  "message": "Video uploaded successfully to X"
}`;

  const uploadResponseError = `{
  "success": false,
  "error": "Authentication required. Please connect your X account first."
}`;

  const statusExample = `curl -X GET ${baseUrl}/api/uploads`;

  const statusResponse = `{
  "uploads": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "My Awesome Video",
      "description": "Check out this amazing video!",
      "status": "success",
      "mediaId": "1880028106020515840",
      "mediaKey": "13_1880028106020515840",
      "createdAt": "2025-01-26T10:30:00Z",
      "completedAt": "2025-01-26T10:32:15Z"
    }
  ]
}`;

  const authStatusExample = `curl -X GET ${baseUrl}/api/auth/status`;

  const authStatusResponse = `{
  "authenticated": true,
  "user": {
    "username": "your_username",
    "userId": "user_123456"
  }
}`;

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative group">
      <div className="absolute right-3 top-3 z-10">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => copyToClipboard(code, id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity gap-2"
          data-testid={`button-copy-${id}`}
        >
          {copiedCode === id ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="p-4 rounded-lg bg-muted overflow-x-auto border border-border">
        <code className="text-sm font-mono text-foreground">{code}</code>
      </pre>
    </div>
  );

  const HttpMethod = ({ method }: { method: string }) => {
    const colors: Record<string, string> = {
      POST: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
      GET: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-border-500/20",
      DELETE: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    };
    return (
      <Badge variant="outline" className={`${colors[method]} font-mono text-xs font-semibold px-3 py-1`}>
        {method}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Code2 className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-semibold text-foreground" data-testid="heading-api-docs">
              API Documentation
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Complete guide to integrating video uploads to X (Twitter) using our API
          </p>
        </div>

        <div className="space-y-8">
          {/* Overview Section */}
          <Card className="p-6" data-testid="section-overview">
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="text-primary">#</span>
              Overview
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                This API enables you to upload videos directly to X (Twitter) using the official X API v2
                chunked upload endpoints. All video processing is handled automatically through a three-step
                process: initialize, append chunks, and finalize.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <h3 className="font-semibold text-foreground">Initialize</h3>
                  </div>
                  <p className="text-sm">Create an upload session with video metadata and total file size</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <h3 className="font-semibold text-foreground">Append</h3>
                  </div>
                  <p className="text-sm">Upload video in chunks sequentially with 2MB recommended size</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <h3 className="font-semibold text-foreground">Finalize</h3>
                  </div>
                  <p className="text-sm">Complete upload and trigger X's processing pipeline</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Authentication Section */}
          <Card className="p-6" data-testid="section-authentication">
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="text-primary">#</span>
              Authentication
            </h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Before uploading videos, you must connect your X account through OAuth 2.0.
                Visit the Authentication tab to authorize the application.
              </p>
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Check Authentication Status</h3>
                <div className="flex items-center gap-2 mb-3">
                  <HttpMethod method="GET" />
                  <code className="text-sm font-mono text-foreground">/api/auth/status</code>
                </div>
                
                <CodeBlock code={authStatusExample} language="bash" id="auth-status-request" />
                
                <h4 className="text-sm font-medium text-foreground mt-4">Response</h4>
                <CodeBlock code={authStatusResponse} language="json" id="auth-status-response" />
              </div>
            </div>
          </Card>

          {/* Upload Endpoint */}
          <Card className="p-6" data-testid="section-upload-endpoint">
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="text-primary">#</span>
              Upload Video
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <HttpMethod method="POST" />
                <code className="text-sm font-mono text-foreground">/api/upload</code>
              </div>

              <p className="text-muted-foreground">
                Upload a video file with metadata. The API handles the complete three-step chunked upload
                process to X automatically.
              </p>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Request Parameters</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-border rounded-lg">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">
                          Parameter
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">
                          Required
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-4 py-3">
                          <code className="text-sm font-mono text-foreground">video</code>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="font-mono text-xs">File</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="default" className="text-xs">Yes</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          Video file (MP4, MOV supported)
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">
                          <code className="text-sm font-mono text-foreground">title</code>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="font-mono text-xs">String</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">No</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          Title of the video (defaults to "Untitled Video")
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">
                          <code className="text-sm font-mono text-foreground">description</code>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="font-mono text-xs">String</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="text-xs">No</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          Optional description of the video
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Example Request</h3>
                <CodeBlock code={uploadExample} language="bash" id="upload-request" />
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Success Response</h3>
                <CodeBlock code={uploadResponseSuccess} language="json" id="upload-response-success" />
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Error Response</h3>
                <CodeBlock code={uploadResponseError} language="json" id="upload-response-error" />
              </div>
            </div>
          </Card>

          {/* Get Uploads Endpoint */}
          <Card className="p-6" data-testid="section-get-uploads">
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="text-primary">#</span>
              Get Upload History
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <HttpMethod method="GET" />
                <code className="text-sm font-mono text-foreground">/api/uploads</code>
              </div>

              <p className="text-muted-foreground">
                Retrieve the complete history of all video uploads with their current status.
              </p>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Example Request</h3>
                <CodeBlock code={statusExample} language="bash" id="status-request" />
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Response</h3>
                <CodeBlock code={statusResponse} language="json" id="status-response" />
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Status Values</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-border">
                    <Badge variant="secondary" className="mb-2">pending</Badge>
                    <p className="text-sm text-muted-foreground">Upload queued, waiting to start</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border">
                    <Badge variant="secondary" className="mb-2">processing</Badge>
                    <p className="text-sm text-muted-foreground">Upload in progress or being processed by X</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border">
                    <Badge variant="default" className="mb-2">success</Badge>
                    <p className="text-sm text-muted-foreground">Video successfully uploaded and ready</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border">
                    <Badge variant="destructive" className="mb-2">failed</Badge>
                    <p className="text-sm text-muted-foreground">Upload failed, check error message</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Error Codes */}
          <Card className="p-6" data-testid="section-error-codes">
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="text-primary">#</span>
              Error Codes
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border border-border rounded-lg">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">
                      Status Code
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">
                      Error
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="font-mono">401</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      Unauthorized
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      X account not connected or OAuth token expired
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="font-mono">400</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      Bad Request
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Missing required fields or invalid file format
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="font-mono">413</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      Payload Too Large
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Video file exceeds maximum size limit
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="font-mono">500</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      Internal Server Error
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Server error during upload or X API communication failure
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Rate Limits */}
          <Card className="p-6 bg-amber-500/5 border-amber-500/20" data-testid="section-rate-limits">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-amber-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Rate Limits</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  X API v2 has the following rate limits for media uploads:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    <span><strong>Free tier:</strong> ~17 uploads per day (initialize/finalize), 85 chunks per day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    <span><strong>Recommended chunk size:</strong> 2 MB (maximum ~5 MB)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    <span><strong>Media expiration:</strong> 24 hours after initialization if not finalized</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
