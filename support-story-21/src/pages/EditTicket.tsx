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
                const message = `Hello ${updatedTicket.contactPerson}, your support ticket ${updatedTicket.ticketNumber} has been resolved. Thank you for your patience!`;
                const whatsappUrl = `https://wa.me/${updatedTicket.mobileNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
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
          initialData={ticket}
          onSubmit={onSubmit} 
          isLoading={isLoading}
          submitButtonText="Update Ticket"
        />
      </div>
    </div>
  );
};

export default EditTicket;