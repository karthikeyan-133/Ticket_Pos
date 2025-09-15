import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SupabaseTest from "@/components/SupabaseTest";
import EnvVarChecker from "@/components/EnvVarChecker";
import ApiTest from "@/components/ApiTest";

export default function TestPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Page</CardTitle>
          <CardDescription>This is a test page for development purposes.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page can be used to test components and functionality during development.</p>
          <div className="mt-4">
            <Button>Test Button</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
          <CardDescription>Test the connection to your Supabase database</CardDescription>
        </CardHeader>
        <CardContent>
          <SupabaseTest />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>Check available environment variables</CardDescription>
        </CardHeader>
        <CardContent>
          <EnvVarChecker />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
          <CardDescription>Test the connection to your backend API</CardDescription>
        </CardHeader>
        <CardContent>
          <ApiTest />
        </CardContent>
      </Card>
    </div>
  );
}