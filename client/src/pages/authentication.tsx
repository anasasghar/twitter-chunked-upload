import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Key, ExternalLink, Shield, Loader2 } from "lucide-react";
import { SiX } from "react-icons/si";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { OAuthToken } from "@shared/schema";

export default function Authentication() {
  const { toast } = useToast();
  const { data: authStatus, isLoading } = useQuery<{ authenticated: boolean; user?: OAuthToken }>({
    queryKey: ["/api/auth/status"],
  });

  const disconnectMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/disconnect"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/status"] });
      toast({
        title: "Disconnected",
        description: "Your X account has been disconnected successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to disconnect your account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleConnect = () => {
    window.location.href = "/api/auth/connect";
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="heading-authentication">
            Authentication
          </h1>
          <p className="text-muted-foreground">
            Connect your X account to enable video uploads via OAuth 2.0
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* OAuth Connection Card */}
          <Card className="p-8" data-testid="card-oauth-connection">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <SiX className="w-12 h-12 text-foreground" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                X Account Connection
              </h2>
              <p className="text-muted-foreground">
                Authorize this application to upload videos on your behalf
              </p>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Checking authentication status...</p>
              </div>
            ) : authStatus?.authenticated ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Connected</p>
                    {authStatus.user?.username && (
                      <p className="text-sm text-muted-foreground" data-testid="text-username">
                        @{authStatus.user.username}
                      </p>
                    )}
                  </div>
                  <Badge variant="default" className="gap-1.5">
                    <Shield className="w-3 h-3" />
                    Active
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">OAuth 2.0 Authorized</p>
                      <p className="text-xs text-muted-foreground">
                        Your account is authenticated with secure OAuth 2.0
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Media Upload Enabled</p>
                      <p className="text-xs text-muted-foreground">
                        You can now upload videos to your X account
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDisconnect}
                  disabled={disconnectMutation.isPending}
                  data-testid="button-disconnect"
                >
                  {disconnectMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Disconnect Account
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                  <XCircle className="w-6 h-6 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Not Connected</p>
                    <p className="text-sm text-muted-foreground">
                      Connect your X account to get started
                    </p>
                  </div>
                </div>

                <Button
                  variant="default"
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleConnect}
                  data-testid="button-connect"
                >
                  <SiX className="w-4 h-4" />
                  Connect X Account
                  <ExternalLink className="w-4 h-4" />
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  You'll be redirected to X to authorize this application
                </p>
              </div>
            )}
          </Card>

          {/* Credentials Information */}
          <Card className="p-8" data-testid="card-credentials-info">
            <div className="flex items-center gap-3 mb-6">
              <Key className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                API Configuration
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Required Credentials</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm font-mono text-foreground mb-1">X_API_CLIENT_ID</p>
                    <p className="text-xs text-muted-foreground">OAuth 2.0 Client ID for authentication</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm font-mono text-foreground mb-1">X_API_CLIENT_SECRET2</p>
                    <p className="text-xs text-muted-foreground">OAuth 2.0 Client Secret for secure token exchange</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm font-mono text-foreground mb-1">X_API_BEARER_TOKEN</p>
                    <p className="text-xs text-muted-foreground">API Bearer Token for making authenticated requests</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Required Scopes</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    media.write
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-xs">
                    tweet.write
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-xs">
                    users.read
                  </Badge>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium text-foreground mb-2">OAuth Callback URL</p>
                <code className="text-xs font-mono text-muted-foreground break-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback` : '/api/auth/callback'}
                </code>
              </div>

              <div className="pt-4 border-t border-border">
                <a
                  href="https://developer.x.com/en/portal/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  Manage credentials in X Developer Portal
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
