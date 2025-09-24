import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import TicketForm from "@/components/tickets/TicketForm";
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
      
      // If ticket was closed, send email and automatically redirect to WhatsApp
      if (isClosingTicket) {
        // Send email notification (handled by backend)
        // Automatically redirect to WhatsApp
        try {
          // Ensure we have a contact person and ticket number
          const contactPerson = updatedTicket.contactPerson || updatedTicket.contact_person || 'Customer';
          const ticketNumber = updatedTicket.ticketNumber || updatedTicket.ticket_number || 'N/A';
          const resolution = updatedTicket.resolution || 'No resolution details provided.';
          
          // Check if resolution is provided
          if (!updatedTicket.resolution || updatedTicket.resolution.trim() === '') {
            toast({
              title: "Resolution Required",
              description: "Please provide resolution details before closing the ticket.",
              variant: "destructive",
            });
            return;
          }
          
          // Create the exact message format you want
          const message = `Hello ${contactPerson}, Your support ticket ${ticketNumber} has been resolved. Resolution Details: ${resolution} Thank you for your patience! Techzon Support Team`;
          
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
              
              // Improved WhatsApp redirect approach for better compatibility
              const encodedMessage = encodeURIComponent(message);
              
              // Detect if user is on mobile or desktop
              const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
              
              if (isMobile) {
                // For mobile devices, use the standard WhatsApp URL scheme
                const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
                window.open(whatsappUrl, '_blank');
              } else {
                // For desktop, provide options to the user
                toast({
                  title: "Send WhatsApp Message",
                  description: "Click the button below to send the WhatsApp message.",
                  action: (
                    <Button 
                      onClick={() => {
                        // Try multiple approaches for desktop WhatsApp
                        const webUrl = `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
                        const apiUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
                        
                        // Try to open WhatsApp Web first
                        const newWindow = window.open(webUrl, '_blank');
                        
                        // If that fails, provide a fallback
                        if (!newWindow) {
                          // Show instructions to user
                          if (confirm("Unable to open WhatsApp automatically. Click OK to open WhatsApp Web manually, or Cancel to copy the message to clipboard.")) {
                            window.open(apiUrl, '_blank');
                          } else {
                            // Copy message to clipboard
                            navigator.clipboard.writeText(message).then(() => {
                              toast({
                                title: "Message Copied",
                                description: "Message copied to clipboard. You can now paste it in WhatsApp.",
                              });
                            }).catch(() => {
                              // Fallback: show alert with message
                              alert("Please copy this message and send it via WhatsApp:\n\n" + message);
                            });
                          }
                        }
                      }}
                    >
                      Send WhatsApp
                    </Button>
                  ),
                });
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