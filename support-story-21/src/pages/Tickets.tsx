import { useState, useEffect } from "react";
import { Search, Filter, Plus, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavLink } from "react-router-dom";
import { ticketAPI } from "@/services/api";
import { toast } from "@/components/ui/use-toast";

// Format date to Dubai time (UTC+4)
const formatToDubaiTime = (dateString: string) => {
  // Handle invalid or missing date values
  if (!dateString || dateString === 'null' || dateString === 'undefined') {
    return 'N/A';
  }
  
  try {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    // Format to Dubai time with better precision
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dubai',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

const Tickets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tickets from backend
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const ticketsData = await ticketAPI.getAll({
        search: searchTerm,
        status: filterStatus !== "all" ? filterStatus : undefined,
        priority: filterPriority !== "all" ? filterPriority : undefined
      });
      
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tickets. Please try again.';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tickets on component mount and when filters change
  useEffect(() => {
    fetchTickets();
  }, [searchTerm, filterStatus, filterPriority]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      open: { label: "Open", className: "bg-status-open text-white" },
      processing: { label: "Processing", className: "bg-status-processing text-white" },
      "on hold": { label: "On Hold", className: "bg-status-hold text-white" },
      closed: { label: "Closed", className: "bg-status-closed text-white" }
    };
    
    const config = statusConfig[status];
    return config ? (
      <Badge className={config.className}>{config.label}</Badge>
    ) : (
      <Badge>{status}</Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { label: string; className: string }> = {
      high: { label: "High", className: "bg-priority-high text-white" },
      medium: { label: "Medium", className: "bg-priority-medium text-white" },
      low: { label: "Low", className: "bg-priority-low text-white" }
    };
    
    const config = priorityConfig[priority];
    return config ? (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    ) : (
      <Badge variant="outline">{priority}</Badge>
    );
  };

  const getIssueTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      data: "Data Related",
      network: "Network Related",
      licence: "Licence Related",
      entry: "Entry Related"
    };
    return labels[type] || type;
  };

  // Function to check if error is related to database connection
  const isDatabaseError = (errorMessage: string) => {
    return errorMessage.includes('timeout') || 
           errorMessage.includes('connection') || 
           errorMessage.includes('database') ||
           errorMessage.includes('Network error');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground">
            Manage and track all customer support requests
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-primary to-primary-hover">
          <NavLink to="/tickets/new">
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </NavLink>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-md text-sm bg-background w-full"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="processing">Processing</option>
                <option value="on hold">On Hold</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-input rounded-md text-sm bg-background w-full"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterPriority("all");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tickets ({tickets.length})</CardTitle>
          <CardDescription>
            Complete list of support tickets with current status and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-32 bg-red-50 rounded-md border border-red-200 p-4">
              <p className="text-red-600 font-medium mb-2">Failed to load tickets</p>
              <p className="text-red-500 text-sm mb-3">{error}</p>
              {isDatabaseError(error) && (
                <div className="text-center mb-3">
                  <p className="text-sm text-muted-foreground">
                    This might be a database connection issue. Please check:
                  </p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside mt-1">
                    <li>If the backend server is running</li>
                    <li>If database credentials are correct</li>
                  </ul>
                </div>
              )}
              <Button onClick={fetchTickets} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Issue Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <TableRow 
                      key={ticket.id}
                      className="hover:bg-muted/50 cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        <NavLink 
                          to={`/tickets/${ticket.id}`}
                          className="text-primary hover:underline"
                        >
                          {ticket.ticket_number || ticket.ticketNumber || `TICKET-${ticket.id}`}
                        </NavLink>
                      </TableCell>
                      <TableCell>{ticket.serial_number || ticket.serialNumber || 'N/A'}</TableCell>
                      <TableCell className="text-foreground">{ticket.company_name || ticket.companyName || 'N/A'}</TableCell>
                      <TableCell className="text-foreground">{ticket.contact_person || ticket.contactPerson || 'N/A'}</TableCell>
                      <TableCell>{getIssueTypeLabel(ticket.issue_related || ticket.issueRelated || 'N/A')}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell className="text-foreground">{ticket.assigned_executive || ticket.assignedExecutive || 'Unassigned'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatToDubaiTime(ticket.created_at || ticket.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <NavLink to={`/tickets/${ticket.id}`}>View Details</NavLink>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <NavLink to={`/tickets/${ticket.id}/edit`}>Edit Ticket</NavLink>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Assign to Me</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Close Ticket
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No tickets found. Try adjusting your search or filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Tickets;