import { 
  Ticket, 
  Users, 
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { ticketAPI } from "@/services/api";
import { executiveAPI } from "@/services/api";
import { toast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    processingTickets: 0,
    closedTickets: 0,
    totalExecutives: 0
  });

  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch tickets
      const ticketsData = await ticketAPI.getAll();
      
      // Calculate ticket statistics
      const totalTickets = Array.isArray(ticketsData) ? ticketsData.length : 0;
      const openTickets = Array.isArray(ticketsData) ? ticketsData.filter((t: any) => t.status === 'open').length : 0;
      const processingTickets = Array.isArray(ticketsData) ? ticketsData.filter((t: any) => t.status === 'processing').length : 0;
      const closedTickets = Array.isArray(ticketsData) ? ticketsData.filter((t: any) => t.status === 'closed').length : 0;
      
      // Get recent tickets (last 4)
      const recent = Array.isArray(ticketsData) ? ticketsData.slice(0, 4) : [];
      
      // Fetch executives
      const executivesData = await executiveAPI.getAll();
      const totalExecutives = Array.isArray(executivesData) ? executivesData.length : 0;
      
      // Update state
      setStats({
        totalTickets,
        openTickets,
        processingTickets,
        closedTickets,
        totalExecutives
      });
      
      setRecentTickets(recent);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again.",
        variant: "destructive",
      });
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { label: "Open", className: "bg-status-open text-white" },
      processing: { label: "Processing", className: "bg-status-processing text-white" },
      hold: { label: "On Hold", className: "bg-status-hold text-white" },
      closed: { label: "Closed", className: "bg-status-closed text-white" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    // Add a fallback for unknown statuses
    if (!config) {
      return <Badge className="bg-gray-500 text-white">Unknown</Badge>;
    }
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { label: "High", className: "bg-priority-high text-white" },
      medium: { label: "Medium", className: "bg-priority-medium text-white" },
      low: { label: "Low", className: "bg-priority-low text-white" }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    // Add a fallback for unknown priorities
    if (!config) {
      return <Badge variant="outline" className="bg-gray-200 text-gray-800">Unknown</Badge>;
    }
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your support tickets today.
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-primary to-primary-hover">
          <NavLink to="/tickets/new">
            <Ticket className="mr-2 h-4 w-4" />
            Create Ticket
          </NavLink>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-card to-muted/20 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Clock className="h-4 w-4 text-status-open" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openTickets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.processingTickets} in progress
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Executives</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExecutives}</div>
            <p className="text-xs text-muted-foreground">
              Active support agents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Tickets</CardTitle>
              <CardDescription>
                Latest customer support requests requiring attention
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <NavLink to="/tickets">View All</NavLink>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentTickets.length > 0 ? (
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{ticket.ticket_number}</p>
                      <p className="text-sm text-muted-foreground">{ticket.remarks || "No description"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{ticket.company_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Ticket className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No tickets yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get started by creating a new ticket.
              </p>
              <div className="mt-6">
                <Button asChild>
                  <NavLink to="/tickets/new">Create Ticket</NavLink>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20 shadow-sm hover:shadow-md transition-all cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Ticket className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">New Ticket</h3>
                <p className="text-sm text-muted-foreground">Create a new support request</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-success/5 border-success/20 shadow-sm hover:shadow-md transition-all cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Manage Executives</h3>
                <p className="text-sm text-muted-foreground">Add or update support agents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;