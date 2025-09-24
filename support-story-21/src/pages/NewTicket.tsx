import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, History } from "lucide-react";
import TicketForm from "@/components/tickets/TicketForm";
import { ticketAPI } from "@/services/api";
import { toast } from "@/components/ui/use-toast";

const NewTicket = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolutionHistory, setResolutionHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();

  const handleCreateTicket = async (data: any) => {
    try {
      setIsSubmitting(true);
      await ticketAPI.create(data);
      toast({
        title: "Success",
        description: "Ticket created successfully",
      });
      navigate("/tickets");
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSerialNumberChange = async (serialNumber: string) => {
    if (serialNumber.length === 9) {
      try {
        // Fetch customer details for this serial number
        const customerData = await ticketAPI.getBySerialNumber(serialNumber);
        
        // Fetch resolution history for this serial number
        const history = await ticketAPI.getResolutionHistory(serialNumber);
        
        // Update the resolution history
        setResolutionHistory(history);
        
        // Show toast notifications
        if (history.length > 0) {
          toast({
            title: "History Found",
            description: `Found ${history.length} previous tickets for this serial number.`,
          });
        } else {
          toast({
            title: "No History",
            description: "No previous tickets found for this serial number.",
          });
        }
      } catch (error: any) {
        console.error("Error fetching serial number data:", error);
        setResolutionHistory([]);
      }
    } else {
      setResolutionHistory([]);
    }
  };

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
        <h1 className="text-3xl font-bold text-foreground flex-1">Create New Ticket</h1>
      </div>

      {/* New Ticket Form */}
      <Card>
        <CardHeader>
          <CardTitle>New Support Ticket</CardTitle>
          <CardDescription>
            Fill in the details below to create a new support ticket. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TicketForm 
            onSubmit={handleCreateTicket} 
            isLoading={isSubmitting}
            submitButtonText="Create Ticket"
            onSerialNumberChange={handleSerialNumberChange}
          />
        </CardContent>
      </Card>

      {/* Resolution History Section */}
      {resolutionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Resolution History
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowHistory(!showHistory)}
                className="ml-auto"
              >
                {showHistory ? "Hide" : "Show"} ({resolutionHistory.length})
              </Button>
            </CardTitle>
          </CardHeader>
          {showHistory && (
            <CardContent>
              <div className="space-y-4">
                {resolutionHistory.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{ticket.ticket_number}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleDateString()} - {ticket.status}
                        </p>
                      </div>
                      {ticket.priority && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                          ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {ticket.priority}
                        </span>
                      )}
                    </div>
                    {ticket.resolution && (
                      <div className="mt-2">
                        <p className="text-sm">
                          <span className="font-medium">Resolution:</span> {ticket.resolution}
                        </p>
                      </div>
                    )}
                    {ticket.issue_related && (
                      <div className="mt-1">
                        <p className="text-sm text-muted-foreground">
                          Issue: {ticket.issue_related}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};

export default NewTicket;