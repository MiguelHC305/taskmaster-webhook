import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Docs() {
  return (
    <>
      <Header title="API Documentation" description="Webhook API reference and integration guide" />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>TaskSync Webhook API</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                The TaskSync Webhook API allows project management systems to send task updates 
                that will be processed, stored, and synchronized across your infrastructure.
              </p>
              
              <h3>Base URL</h3>
              <code className="bg-slate-100 px-2 py-1 rounded">
                {window.location.origin}/api
              </code>
            </CardContent>
          </Card>

          {/* Webhook Endpoint */}
          <Card>
            <CardHeader>
              <CardTitle>Task Update Webhook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">POST</Badge>
                <code className="bg-slate-100 px-2 py-1 rounded">/api/webhook/tasks</code>
              </div>
              
              <p className="text-sm text-slate-600">
                Send task updates from your project management system to this endpoint.
              </p>

              <div>
                <h4 className="font-semibold mb-2">Request Body Schema</h4>
                <pre className="bg-slate-50 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "title": "string (required)",
  "description": "string (optional)",
  "status": "pending|in-progress|completed|cancelled (required)",
  "priority": "low|medium|high|urgent (optional, default: medium)",
  "projectName": "string (required)",
  "assignee": "string (optional)",
  "sourceSystem": "string (required)",
  "externalId": "string (optional)",
  "metadata": "object (optional)"
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Example Request</h4>
                <pre className="bg-slate-50 p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X POST ${window.location.origin}/api/webhook/tasks \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication system",
    "status": "completed",
    "priority": "high",
    "projectName": "Web Application",
    "assignee": "john.doe@company.com",
    "sourceSystem": "jira",
    "externalId": "PROJ-123",
    "metadata": {
      "labels": ["backend", "security"],
      "estimatedHours": 8
    }
  }'`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Response</h4>
                <pre className="bg-slate-50 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "success": true,
  "taskId": "uuid-string",
  "action": "created|updated"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Behavior */}
          <Card>
            <CardHeader>
              <CardTitle>Webhook Behavior</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Task Creation vs Updates</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                  <li>If <code>externalId</code> is provided and a task with the same external ID and source system exists, the task will be updated</li>
                  <li>Otherwise, a new task will be created</li>
                  <li>The response will indicate whether the task was "created" or "updated"</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Email Notifications</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                  <li>Email notifications are automatically sent when a task status changes to "completed"</li>
                  <li>Notifications are also sent when webhook processing fails</li>
                  <li>Email templates can be customized through the Notifications page</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">External Synchronization</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                  <li>Task updates are automatically synchronized with external services</li>
                  <li>Synchronization happens asynchronously and includes retry logic</li>
                  <li>Failed sync attempts are logged and can be monitored</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Status Codes */}
          <Card>
            <CardHeader>
              <CardTitle>Response Status Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary">200</Badge>
                  <span className="text-sm">Task processed successfully</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="destructive">400</Badge>
                  <span className="text-sm">Invalid request payload or validation error</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="destructive">500</Badge>
                  <span className="text-sm">Internal server error</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Check */}
          <Card>
            <CardHeader>
              <CardTitle>Health Check Endpoint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">GET</Badge>
                <code className="bg-slate-100 px-2 py-1 rounded">/api/health</code>
              </div>
              
              <p className="text-sm text-slate-600">
                Check the health status of the webhook system and all dependent services.
              </p>

              <div>
                <h4 className="font-semibold mb-2">Example Response</h4>
                <pre className="bg-slate-50 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "status": "healthy",
  "timestamp": "2024-08-08T12:00:00.000Z",
  "services": {
    "database": {
      "status": "healthy",
      "message": "In-memory storage operational"
    },
    "email": {
      "status": "healthy",
      "message": "SMTP connection successful"
    },
    "sync": {
      "status": "healthy",
      "message": "External sync service responsive",
      "responseTime": 142
    }
  }
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-3">Environment Variables</h4>
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <code className="font-semibold">SMTP_HOST</code>
                  <p className="text-sm text-slate-600">SMTP server hostname (default: smtp.gmail.com)</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <code className="font-semibold">SMTP_USER</code>
                  <p className="text-sm text-slate-600">SMTP username for authentication</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <code className="font-semibold">SMTP_PASS</code>
                  <p className="text-sm text-slate-600">SMTP password for authentication</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <code className="font-semibold">NOTIFICATION_EMAIL</code>
                  <p className="text-sm text-slate-600">Email address to receive notifications</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <code className="font-semibold">EXTERNAL_SYNC_URL</code>
                  <p className="text-sm text-slate-600">Base URL for external sync service</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <code className="font-semibold">EXTERNAL_SYNC_API_KEY</code>
                  <p className="text-sm text-slate-600">API key for external sync service</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
