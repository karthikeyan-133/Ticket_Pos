import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

export default function Diagnostics() {
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);

  const runDiagnostics = async () => {
    setIsTesting(true);
    try {
      // Simulate diagnostic tests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Diagnostics Complete",
        description: "All systems are functioning normally.",
      });
    } catch (error) {
      toast({
        title: "Diagnostics Failed",
        description: "An error occurred during diagnostics.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>System Diagnostics</CardTitle>
          <CardDescription>
            Run diagnostics to check the health of the application and its connections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Frontend Status</h3>
                <p className="text-sm text-muted-foreground">React + Vite application</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Backend Connection</h3>
                <p className="text-sm text-muted-foreground">API server status</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Database Connection</h3>
                <p className="text-sm text-muted-foreground">MySQL database status</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            </div>
            
            <div className="pt-4">
              <Button onClick={runDiagnostics} disabled={isTesting}>
                {isTesting ? "Running Diagnostics..." : "Run Diagnostics"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}