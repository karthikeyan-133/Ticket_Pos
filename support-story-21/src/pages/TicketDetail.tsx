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

  // Format date to India time (UTC+5:30)
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
        timeZone: 'Asia/Kolkata',
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
      
      // Automatically redirect to WhatsApp if ticket was closed
      if (status === "closed" && !ticket.closedAt) {
        // Send email notification (handled by backend)
        // Automatically redirect to WhatsApp
        try {
          // Create the exact message format you want
          const contactPerson = ticket.contactPerson || ticket.contact_person || 'Customer';
          const ticketNumber = ticket.ticketNumber || ticket.ticket_number || 'N/A';
          const resolutionText = resolution || 'No resolution details provided.';
          
          // Check if resolution is provided
          if (!resolution || resolution.trim() === '') {
            toast({
              title: "Resolution Required",
              description: "Please provide resolution details before closing the ticket.",
              variant: "destructive",
            });
            return;
          }
          
          // Create the exact message format you want
          const message = `Hello ${contactPerson}, Your support ticket ${ticketNumber} has been resolved. Resolution Details: ${resolutionText} Thank you for your patience! Techzon Support Team`;
          
          // Ensure mobile number exists and is properly formatted
          let mobileNumber = ticket.mobileNumber || ticket.mobile_number || '';
          
          // Handle various data types that might come from the API
          if (mobileNumber === null || mobileNumber === undefined) {
            mobileNumber = '';
          } else if (typeof mobileNumber !== 'string') {
            mobileNumber = String(mobileNumber);
          }
          
          // Check if mobile number is empty or invalid
          if (!mobileNumber || mobileNumber.trim() === '') {
            toast({
              title: "WhatsApp Error",
              description: "Mobile number not available for WhatsApp message. Customer will still receive email notification.",
              variant: "destructive",
            });
          } else {
            // Safely clean the mobile number
            let cleanNumber = '';
            try {
              cleanNumber = mobileNumber.replace(/\D/g, '');
            } catch (error) {
              console.error('Error cleaning mobile number:', error);
              toast({
                title: "WhatsApp Error",
                description: "Invalid mobile number format for WhatsApp message. Customer will still receive email notification.",
                variant: "destructive",
              });
              cleanNumber = '';
            }
            
            if (cleanNumber && cleanNumber.trim() !== '') {
              // Add country code if not present (assuming UAE/India format)
              // For UAE numbers starting with 05, we need to replace the leading 0 with 971
              let whatsappNumber;
              if (cleanNumber.startsWith('05') && cleanNumber.length === 10) {
                // UAE format: 05XXXXXXXX -> 9715XXXXXXXX
                whatsappNumber = `971${cleanNumber.substring(1)}`;
              } else if (cleanNumber.length === 9 && cleanNumber.startsWith('5')) {
                // UAE format: 5XXXXXXXX -> 9715XXXXXXXX
                whatsappNumber = `971${cleanNumber}`;
              } else if (cleanNumber.length === 10) {
                // Other 10-digit formats: add 971 prefix
                whatsappNumber = `971${cleanNumber}`;
              } else {
                // Use as-is for other formats
                whatsappNumber = cleanNumber;
              }
              
              // Try a different approach - use api.whatsapp.com instead of wa.me
              // Also use rawurlencode instead of urlencode for better compatibility
              const encodedMessage = encodeURIComponent(message);
              const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
              
              console.log('WhatsApp URL:', whatsappUrl); // For debugging
              // Try opening in the same window first, then fallback to new tab
              const newWindow = window.open(whatsappUrl, '_blank');
              if (!newWindow) {
                // Fallback: try opening in the same window
                window.location.href = whatsappUrl;
              }
              
              // Show success message
              toast({
                title: "Ticket Closed",
                description: "Customer will receive email notification and WhatsApp message.",
              });
            } else {
              toast({
                title: "WhatsApp Error",
                description: "Invalid mobile number format for WhatsApp message. Customer will still receive email notification.",
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          console.error('Error in WhatsApp redirect:', error);
          toast({
            title: "WhatsApp Error",
            description: "Failed to send WhatsApp message. Customer will still receive email notification.",
            variant: "destructive",
          });
        }
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
                  <CardTitle className="text-2xl">{ticket.ticket_number || ticket.ticketNumber || `Ticket #${ticket.id}`}</CardTitle>
                  <CardDescription>
                    Created on {formatToDubaiTime(ticket.created_at || ticket.createdAt)}
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
                  <p className="font-medium">{ticket.serial_number || ticket.serialNumber || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Company Name</Label>
                  <p className="font-medium">{ticket.company_name || ticket.companyName || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Contact Person</Label>
                  <p className="font-medium">{ticket.contact_person || ticket.contactPerson || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Mobile Number</Label>
                  <p className="font-medium">{ticket.mobile_number || ticket.mobileNumber || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email ID</Label>
                  <p className="font-medium">{ticket.email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Issue Related To</Label>
                  <p className="font-medium">{getIssueTypeLabel(ticket.issue_related || ticket.issueRelated || 'N/A')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Assigned Office Staff</Label>
                  <p className="font-medium">{ticket.assigned_executive || ticket.assignedExecutive || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Licence Type</Label>
                  <p className="font-medium">{getUserTypeLabel(ticket.user_type || ticket.userType || 'N/A')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Expiry Date</Label>
                  <p className="font-medium">
                    {ticket.expiry_date || ticket.expiryDate ? format(new Date(ticket.expiry_date || ticket.expiryDate), "PPP") : "N/A"}
                  </p>
                </div>
                {ticket.closed_at || ticket.closedAt && (
                  <div>
                    <Label className="text-muted-foreground">Closed At</Label>
                    <p className="font-medium">{formatToDubaiTime(ticket.closed_at || ticket.closedAt)}</p>
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
                      {formatToDubaiTime(ticket.created_at || ticket.createdAt)}
                    </p>
                  </div>
                </div>
                {(ticket.closed_at || ticket.closedAt) && (
                  <div className="flex gap-3">
                    <div className="mt-1 rounded-full bg-primary p-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Ticket Closed</p>
                      <p className="text-sm text-muted-foreground">
                        {formatToDubaiTime(ticket.closed_at || ticket.closedAt)}
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