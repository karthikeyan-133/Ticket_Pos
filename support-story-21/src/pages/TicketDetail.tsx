import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Ticket, 
  User, 
  Calendar, 
  Clock, 
  Mail, 
  Phone, 
  Building, 
  Tag, 
  AlertCircle,
  CheckCircle,
  XCircle,
  PauseCircle,
  Edit,
  MessageCircle,
  ChevronLeft
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ticketAPI } from "@/services/api";
import { toast } from "@/components/ui/use-toast";

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [resolution, setResolution] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch ticket details
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const ticketData = await ticketAPI.getById(id!);
        setTicket(ticketData);
        setStatus(ticketData.status);
        setResolution(ticketData.resolution);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch ticket details. Please try again.",
          variant: "destructive",
        });
        console.error("Error fetching ticket:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTicket();
    }
  }, [id]);

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
      
      return new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Dubai',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

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

  const getUserTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "single user": "Single User",
      "multiuser": "Multiuser"
    };
    return labels[type] || type;
  };

  const handleStatusChange = async () => {
    try {
      const updatedData = {
        ...ticket,
        status: status,
        resolution: resolution,
        closedAt: status === "closed" && !ticket.closedAt ? new Date().toISOString() : ticket.closedAt
      };
      
      const result = await ticketAPI.update(id!, updatedData);
      
      // Update local state
      setTicket({
        ...ticket,
        status: status,
        resolution: resolution,
        closedAt: status === "closed" && !ticket.closedAt ? new Date().toISOString() : ticket.closedAt
      });
      
      toast({
        title: "Status Updated",
        description: "Ticket status has been updated successfully.",
      });
      
      // Show notification options if ticket was closed
      if (status === "closed" && !ticket.closedAt) {
        toast({
          title: "Ticket Closed",
          description: "Customer will receive email notification. You can also send a WhatsApp message.",
          action: (
            <button 
              onClick={() => {
                const message = `Hello ${ticket.contactPerson}, your support ticket ${ticket.ticketNumber} has been resolved. Resolution: ${resolution || 'No resolution details provided.'}`;
                const whatsappUrl = `https://wa.me/${ticket.mobileNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
              }}
              className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              WhatsApp
            </button>
          ),
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket status. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating ticket:", error);
    }
  };

  const handleUpdateResolution = async () => {
    try {
      const updatedData = {
        ...ticket,
        resolution: resolution
      };
      
      await ticketAPI.update(id!, updatedData);
      
      // Update local state
      setTicket({
        ...ticket,
        resolution: resolution
      });
      
      toast({
        title: "Resolution Updated",
        description: "Ticket resolution has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket resolution. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating resolution:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Ticket Not Found</h2>
          <p className="text-muted-foreground">The requested ticket could not be found.</p>
          <Button 
            onClick={() => navigate("/tickets")}
            className="mt-4"
          >
            Back to Tickets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/tickets")}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Tickets
        </Button>
        <h1 className="text-3xl font-bold text-foreground flex-1">Ticket Details</h1>
        <Button 
          variant="outline"
          onClick={() => navigate(`/tickets/${id}/edit`)}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit Ticket
        </Button>
        <Button>Print Ticket</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{ticket.ticketNumber}</CardTitle>
                  <CardDescription>
                    Created on {formatToDubaiTime(ticket.createdAt)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tally Serial Number</Label>
                  <p className="font-medium">{ticket.serialNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Company Name</Label>
                  <p className="font-medium">{ticket.companyName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Contact Person</Label>
                  <p className="font-medium">{ticket.contactPerson}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Mobile Number</Label>
                  <p className="font-medium">{ticket.mobileNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email ID</Label>
                  <p className="font-medium">{ticket.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Issue Related To</Label>
                  <p className="font-medium">{getIssueTypeLabel(ticket.issueRelated)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Assigned Office Staff</Label>
                  <p className="font-medium">{ticket.assignedExecutive}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Licence Type</Label>
                  <p className="font-medium">{getUserTypeLabel(ticket.userType)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Expiry Date</Label>
                  <p className="font-medium">
                    {ticket.expiryDate ? format(new Date(ticket.expiryDate), "PPP") : "N/A"}
                  </p>
                </div>
                {ticket.closedAt && (
                  <div>
                    <Label className="text-muted-foreground">Closed At</Label>
                    <p className="font-medium">{formatToDubaiTime(ticket.closedAt)}</p>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-muted-foreground">Remarks</Label>
                <p className="font-medium mt-1">{ticket.remarks || "No remarks provided"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Resolution Section */}
          <Card>
            <CardHeader>
              <CardTitle>Resolution</CardTitle>
              <CardDescription>
                Update the resolution details for this ticket
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution Details</Label>
                <Textarea
                  id="resolution"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Enter resolution details..."
                  className="min-h-[120px]"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleUpdateResolution}>Update Resolution</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
              <CardDescription>Change the current status of this ticket</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="on hold">On Hold</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleStatusChange}>
                Update Status
              </Button>
            </CardContent>
          </Card>

          {/* Ticket Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Timeline</CardTitle>
              <CardDescription>Key events in this ticket's lifecycle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="mt-1 rounded-full bg-primary p-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Ticket Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatToDubaiTime(ticket.createdAt)}
                    </p>
                  </div>
                </div>
                {ticket.closedAt && (
                  <div className="flex gap-3">
                    <div className="mt-1 rounded-full bg-primary p-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Ticket Closed</p>
                      <p className="text-sm text-muted-foreground">
                        {formatToDubaiTime(ticket.closedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;