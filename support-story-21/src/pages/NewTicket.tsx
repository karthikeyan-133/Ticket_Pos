import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { TicketForm } from "@/components/tickets/TicketForm";
import { ticketAPI } from "@/services/api";

const NewTicket = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle form submission
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    
    try {
      // Create ticket via API
      const newTicket = await ticketAPI.create(data);
      
      toast({
        title: "Ticket Created",
        description: `Support ticket ${newTicket.ticketNumber} has been created successfully.`,
      });
      
      // Redirect to tickets list
      navigate("/tickets");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create New Ticket</h1>
        <p className="text-muted-foreground">
          Fill in the details to create a new support ticket
        </p>
      </div>

      <div className="grid gap-6">
        <TicketForm 
          onSubmit={onSubmit} 
          isLoading={isLoading}
          submitButtonText="Create Ticket"
        />
      </div>
    </div>
  );
};

export default NewTicket;