import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Plus, MoreHorizontal, Download, History } from "lucide-react";
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
import { NavLink, useNavigate } from "react-router-dom";
import { ticketAPI } from "@/services/api";
import { toast } from "@/components/ui/use-toast";
import ExportToExcel from "@/components/ExportToExcel";

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
  const navigate = useNavigate();
  const [serialNumberSearch, setSerialNumberSearch] = useState("");

  // Enhanced search function that navigates directly to ticket if exact match found
  const handleDirectTicketSearch = useCallback(async (term: string) => {
    if (!term.trim()) return false;

    try {
      // First check if this is a direct ticket number
      const ticketsData = await ticketAPI.getAll({
        search: term
      });

      if (Array.isArray(ticketsData)) {
        // Check if we have exactly one result and it's an exact match for ticket number
        const exactMatch = ticketsData.find(ticket => 
          (ticket.ticket_number || ticket.ticketNumber) === term
        );

        if (exactMatch && ticketsData.length === 1) {
          // Navigate directly to the ticket
          navigate(`/tickets/${exactMatch.id}`);
          return true;
        }
      }
      return false;
    } catch (error: any) {
      console.error("Error in direct ticket search:", error);
      return false;
    }
  }, [navigate]);

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

  // Fetch tickets by serial number
  const fetchTicketsBySerialNumber = async () => {
    if (!serialNumberSearch.trim()) {
      // If serial number search is empty, fetch all tickets
      fetchTickets();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Validate serial number format (must be 9 digits)
      const cleanSerialNumber = serialNumberSearch.replace(/\D/g, '');
      if (cleanSerialNumber.length !== 9) {
        throw new Error('Tally serial number must be exactly 9 digits');
      }
      
      const ticketsData = await ticketAPI.getAll({
        serialNumber: cleanSerialNumber
      });
      
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tickets by serial number. Please try again.';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error fetching tickets by serial number:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch resolution history by serial number
  const fetchResolutionHistory = async () => {
    if (!serialNumberSearch.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Tally serial number to view resolution history.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Validate serial number format (must be 9 digits)
      const cleanSerialNumber = serialNumberSearch.replace(/\D/g, '');
      if (cleanSerialNumber.length !== 9) {
        throw new Error('Tally serial number must be exactly 9 digits');
      }
      
      const historyData = await ticketAPI.getResolutionHistory(cleanSerialNumber);
      
      setTickets(Array.isArray(historyData) ? historyData : []);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch resolution history. Please try again.';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error fetching resolution history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search with direct navigation for exact ticket numbers
  const handleSearch = async () => {
    // Try direct ticket navigation first
    const navigated = await handleDirectTicketSearch(searchTerm);
    if (!navigated) {
      // If not navigated, trigger normal search
      fetchTickets();
    }
  };

  // Fetch tickets on component mount and when filters change
  useEffect(() => {
    if (serialNumberSearch) {
      fetchTicketsBySerialNumber();
    } else {
      fetchTickets();
    }
  }, [filterStatus, filterPriority, serialNumberSearch]);

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

  // Define export columns
  const exportColumns = [
    { key: 'ticket_number', label: 'Ticket Number' },
    { key: 'serial_number', label: 'Serial Number' },
    { key: 'company_name', label: 'Company Name' },
    { key: 'contact_person', label: 'Contact Person' },
    { key: 'issue_related', label: 'Issue Type' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'assigned_executive', label: 'Assigned To' },
    { key: 'created_at', label: 'Created At' },
    { key: 'closed_at', label: 'Closed At' },
    { key: 'resolution', label: 'Resolution' }
  ];

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
        <div className="flex space-x-2">
          <ExportToExcel 
            data={tickets} 
            filename="support-tickets" 
            columns={exportColumns} 
          />
          <Button asChild className="bg-gradient-to-r from-primary to-primary-hover">
            <NavLink to="/tickets/new">
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </NavLink>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="pl-9"
              />
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                variant="ghost"
                size="sm"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="9-digit Serial Number..."
                value={serialNumberSearch}
                onChange={(e) => {
                  // Only allow digits and limit to 9 characters
                  const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                  setSerialNumberSearch(value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fetchTicketsBySerialNumber();
                  }
                }}
                className="pl-9"
                maxLength={9}
              />
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                variant="ghost"
                size="sm"
                onClick={fetchTicketsBySerialNumber}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              onClick={fetchResolutionHistory}
              variant="outline"
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              Resolution History
            </Button>
            
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
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              <p>{error}</p>
              {isDatabaseError(error) && (
                <p className="mt-2 text-sm">
                  Please check your database connection and try again.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Tickets Table */}
      {!loading && !error && (
        <Card>
          <CardHeader>
            <CardTitle>
              {serialNumberSearch 
                ? `Tickets for Serial: ${serialNumberSearch}` 
                : "All Tickets"}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({tickets.length} tickets)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {serialNumberSearch 
                    ? `No tickets found for serial number ${serialNumberSearch}` 
                    : "No tickets found matching your search criteria"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket Number</TableHead>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Issue Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">
                          {ticket.ticket_number || ticket.ticketNumber}
                        </TableCell>
                        <TableCell>
                          {ticket.serial_number || ticket.serialNumber}
                        </TableCell>
                        <TableCell>
                          {ticket.company_name || ticket.companyName}
                        </TableCell>
                        <TableCell>
                          {ticket.contact_person || ticket.contactPerson}
                        </TableCell>
                        <TableCell>
                          {getIssueTypeLabel(ticket.issue_related || ticket.issueRelated)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(ticket.status)}
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(ticket.priority)}
                        </TableCell>
                        <TableCell>
                          {formatToDubaiTime(ticket.created_at || ticket.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/tickets/${ticket.id}`)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/tickets/${ticket.id}/edit`)}>
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Tickets;