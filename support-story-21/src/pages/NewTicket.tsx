import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ChevronLeft, History } from "lucide-react";
import TicketForm from "@/components/tickets/TicketForm";
import { ticketAPI } from "@/services/api";
import { toast } from "@/components/ui/use-toast";

const NewTicket = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolutionHistory, setResolutionHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [serialNumberSearch, setSerialNumberSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [customerData, setCustomerData] = useState<any>(null);
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

  const handleSerialNumberSearch = async () => {
    if (!serialNumberSearch.trim()) {
      toast({
        title: "Error",
        description: "Please enter a serial number to search.",
        variant: "destructive",
      });
      return;
    }

    // Validate serial number format (must be 9 digits)
    const cleanSerialNumber = serialNumberSearch.replace(/\D/g, '').slice(0, 9);
    if (cleanSerialNumber.length !== 9) {
      toast({
        title: "Error",
        description: "Tally serial number must be exactly 9 digits",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      // Fetch customer details for this serial number
      const customerData = await ticketAPI.getBySerialNumber(cleanSerialNumber);
      
      // Fetch resolution history for this serial number
      const history = await ticketAPI.getResolutionHistory(cleanSerialNumber);
      
      // Update the customer data
      setCustomerData(customerData);
      
      // Update the resolution history
      setResolutionHistory(history);
      
      // If we found customer data, show a success message
      if (customerData && Object.keys(customerData).length > 0) {
        toast({
          title: "Customer Found",
          description: "Customer details have been pre-filled in the form.",
        });
      }
      
      // Show history message
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
      console.error("Error searching serial number:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to search serial number. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Prepare initial data for the form
  const prepareInitialData = () => {
    if (!customerData || Object.keys(customerData).length === 0) {
      return {};
    }
    
    return {
      serialNumber: customerData.serial_number || customerData.serialNumber || "",
      companyName: customerData.company_name || customerData.companyName || "",
      contactPerson: customerData.contact_person || customerData.contactPerson || "",
      mobileNumber: customerData.mobile_number || customerData.mobileNumber || "",
      email: customerData.email || "",
      userType: customerData.user_type || customerData.userType || "single user",
      expiryDate: customerData.expiry_date || customerData.expiryDate || "",
      assignedExecutive: customerData.assigned_executive || customerData.assignedExecutive || ""
    };
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

      {/* Serial Number Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search by Serial Number</CardTitle>
          <CardDescription>
            Search for existing customer details and resolution history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Label htmlFor="serialSearch" className="sr-only">
                Serial Number
              </Label>
              <Input
                id="serialSearch"
                placeholder="Enter 9-digit Tally serial number"
                value={serialNumberSearch}
                onChange={(e) => {
                  // Only allow digits and limit to 9 characters
                  const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                  setSerialNumberSearch(value);
                }}
                maxLength={9}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSerialNumberSearch();
                  }
                }}
              />
            </div>
            <Button 
              onClick={handleSerialNumberSearch} 
              disabled={isSearching}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
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
            initialData={prepareInitialData()}
            onSubmit={handleCreateTicket} 
            isLoading={isSubmitting}
            submitButtonText="Create Ticket"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTicket;