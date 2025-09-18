import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { TicketForm } from "@/components/tickets/TicketForm";
import { ticketAPI } from "@/services/api";
import { Button } from "@/components/ui/button";

const EditTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch ticket details
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const ticketData = await ticketAPI.getById(id!);
        setTicket(ticketData);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch ticket details. Please try again.",
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

  // Handle form submission
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    
    try {
      // Check if status is changing from open to closed
      const isClosingTicket = ticket?.status === "open" && data.status === "closed";
      
      // Update ticket via API
      const updatedTicket = await ticketAPI.update(id!, data);
      
      toast({
        title: "Ticket Updated",
        description: `Support ticket ${updatedTicket.ticketNumber} has been updated successfully.`,
      });
      
      // If ticket was closed, send email and show WhatsApp option
      if (isClosingTicket) {
        // Show toast with WhatsApp option
        toast({
          title: "Ticket Closed",
          description: "Customer will receive email notification. You can also send a WhatsApp message.",
          action: (
            <button 
              onClick={() => {
                try {
                  // Ensure we have a contact person and ticket number
                  const contactPerson = updatedTicket.contactPerson || updatedTicket.contact_person || 'Customer';
                  const ticketNumber = updatedTicket.ticketNumber || updatedTicket.ticket_number || 'N/A';
                  
                  // Create a more detailed and properly formatted message
                  const message = `Hello ${contactPerson},

Your support ticket ${ticketNumber} has been resolved.

Thank you for your patience!

Techzon Support Team`;
                  
                  // Ensure mobile number exists and is properly formatted
                  let mobileNumber = updatedTicket.mobileNumber || updatedTicket.mobile_number || '';
                  
                  // Handle various data types that might come from the API
                  if (mobileNumber === null || mobileNumber === undefined) {
                    mobileNumber = '';
                  } else if (typeof mobileNumber !== 'string') {
                    mobileNumber = String(mobileNumber);
                  }
                  
                  // Check if mobile number is empty or invalid
                  if (!mobileNumber || mobileNumber.trim() === '') {
                    toast({
                      title: "Error",
                      description: "Mobile number not available for WhatsApp message.",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  // Safely clean the mobile number
                  let cleanNumber = '';
                  try {
                    cleanNumber = mobileNumber.replace(/\D/g, '');
                  } catch (error) {
                    console.error('Error cleaning mobile number:', error);
                    toast({
                      title: "Error",
                      description: "Invalid mobile number format for WhatsApp message.",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  if (!cleanNumber || cleanNumber.trim() === '') {
                    toast({
                      title: "Error",
                      description: "Invalid mobile number format for WhatsApp message.",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  // Add country code if not present (assuming UAE/India format)
                  const whatsappNumber = cleanNumber.length === 10 ? `971${cleanNumber}` : cleanNumber;
                  
                  // Properly encode the message for URL
                  const encodedMessage = encodeURIComponent(message);
                  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
                  
                  console.log('WhatsApp URL:', whatsappUrl); // For debugging
                  window.open(whatsappUrl, '_blank');
                } catch (error) {
                  console.error('Error in WhatsApp redirect:', error);
                  toast({
                    title: "Error",
                    description: "Failed to open WhatsApp. Please try again.",
                    variant: "destructive",
                  });
                }
              }}
              className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Send WhatsApp
            </button>
          ),
        });
      }
      
      // Redirect to ticket detail page
      navigate(`/tickets/${id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  // Prepare initial data for the form, ensuring proper field mapping
  const prepareInitialData = () => {
    return {
      serialNumber: ticket.serialNumber || ticket.serial_number || "",
      companyName: ticket.companyName || ticket.company_name || "",
      contactPerson: ticket.contactPerson || ticket.contact_person || "",
      mobileNumber: ticket.mobileNumber || ticket.mobile_number || "",
      email: ticket.email || "",
      issueRelated: ticket.issueRelated || ticket.issue_related || "data",
      priority: ticket.priority || "medium",
      assignedExecutive: ticket.assignedExecutive || ticket.assigned_executive || "",
      status: ticket.status || "open",
      userType: ticket.userType || ticket.user_type || "single user",
      expiryDate: ticket.expiryDate || ticket.expiry_date ? new Date(ticket.expiryDate || ticket.expiry_date) : undefined,
      resolution: ticket.resolution || "",
      remarks: ticket.remarks || "",
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Ticket</h1>
        <p className="text-muted-foreground">
          Update the details for ticket {ticket.ticketNumber}
        </p>
      </div>

      <div className="grid gap-6">
        <TicketForm 
          initialData={prepareInitialData()}
          onSubmit={onSubmit} 
          isLoading={isLoading}
          submitButtonText="Update Ticket"
        />
      </div>
    </div>
  );
};

export default EditTicket;