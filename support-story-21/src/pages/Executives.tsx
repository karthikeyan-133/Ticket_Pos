import { useState, useEffect } from "react";
import { Search, Plus, Mail, Phone, MoreHorizontal, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { executiveAPI } from "@/services/api";
import { toast } from "@/components/ui/use-toast";
import { ExecutiveForm } from "@/components/executives/ExecutiveForm";
import ExportToExcel from "@/components/ExportToExcel";

// Define the executive data structure
interface Executive {
  id: string | number;
  name: string;
  email: string;
  mobile: string;
  department: string;
  is_active: boolean;
  isActive?: boolean; // For backward compatibility
}

const Executives = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedExecutive, setSelectedExecutive] = useState<Executive | null>(null);

  // Validate executive data format
  const validateExecutiveData = (exec: any): exec is Executive => {
    // Check if the executive object has the required properties
    const hasRequiredProps = (
      exec &&
      typeof exec === 'object' &&
      (typeof exec.id === 'string' || typeof exec.id === 'number') &&
      typeof exec.name === 'string' &&
      typeof exec.email === 'string' &&
      typeof exec.mobile === 'string' &&
      typeof exec.department === 'string'
    );
    
    // Check if it has either is_active or isActive as a boolean
    const hasValidStatus = (
      (exec.is_active !== undefined && typeof exec.is_active === 'boolean') ||
      (exec.isActive !== undefined && typeof exec.isActive === 'boolean')
    );
    
    return hasRequiredProps && hasValidStatus;
  };

  // Fetch executives from backend
  const fetchExecutives = async () => {
    try {
      setLoading(true);
      setError(null);
      const executivesData = await executiveAPI.getAll();
      
      console.log('Executives data received:', executivesData);
      
      // Handle case where data is null or undefined
      if (executivesData === null || executivesData === undefined) {
        setExecutives([]);
        return;
      }
      
      // Handle case where data is not an array
      if (!Array.isArray(executivesData)) {
        console.error('Invalid data format received from server: Expected array, got:', typeof executivesData, executivesData);
        // Try to convert to array if it's an object
        if (typeof executivesData === 'object') {
          setExecutives([]);
        } else {
          throw new Error(`Invalid data format received from server: Expected array, got ${typeof executivesData}`);
        }
        return;
      }
      
      // Validate each executive object
      const validExecutives: Executive[] = [];
      const invalidExecutives: any[] = [];
      
      executivesData.forEach((exec: any) => {
        if (validateExecutiveData(exec)) {
          validExecutives.push(exec);
        } else {
          invalidExecutives.push(exec);
        }
      });
      
      if (invalidExecutives.length > 0) {
        console.warn('Invalid executive data received:', invalidExecutives);
        // Try to normalize the data to ensure consistent format
        const normalizedData = invalidExecutives.map((exec: any) => ({
          id: exec.id || Math.random().toString(36).substr(2, 9),
          name: exec.name || 'Unknown Executive',
          email: exec.email || '',
          mobile: exec.mobile || exec.phone || '',
          department: exec.department || 'Support',
          // Ensure we have is_active property for consistent interface
          is_active: exec.is_active !== undefined ? exec.is_active : (exec.isActive !== undefined ? exec.isActive : true)
        }));
        
        setExecutives([...validExecutives, ...normalizedData]);
      } else {
        setExecutives(validExecutives);
      }
    } catch (error: any) {
      console.error("Error fetching executives:", error);
      let errorMessage = 'Failed to fetch executives. Please try again.';
      
      // Provide more specific error messages based on the error type
      if (error.message) {
        if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
          errorMessage = 'Unable to connect to the server. Please check if the backend is running.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please check your network connection.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for adding a new executive
  const handleAddExecutive = async (data: any) => {
    try {
      setIsSubmitting(true);
      // Ensure data is in the correct format for the backend
      const executiveData = {
        name: data.name,
        email: data.email,
        mobile: data.mobile || '',
        department: data.department || '',
        // Send both formats for compatibility
        is_active: data.is_active !== undefined ? data.is_active : (data.isActive !== undefined ? data.isActive : true),
        isActive: data.is_active !== undefined ? data.is_active : (data.isActive !== undefined ? data.isActive : true)
      };
      
      await executiveAPI.create(executiveData);
      toast({
        title: "Success",
        description: "Executive added successfully",
      });
      setIsAddDialogOpen(false);
      fetchExecutives(); // Refresh the list
    } catch (error: any) {
      console.error("Error adding executive:", error);
      let errorMessage = 'Failed to add executive. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
          errorMessage = 'Unable to connect to the server. Please check if the backend is running.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission for editing an executive
  const handleEditExecutive = async (data: any) => {
    try {
      if (!selectedExecutive) return;
      
      setIsSubmitting(true);
      // Ensure data is in the correct format for the backend
      const executiveData = {
        name: data.name,
        email: data.email,
        mobile: data.mobile || '',
        department: data.department || '',
        // Send both formats for compatibility
        is_active: data.is_active !== undefined ? data.is_active : (data.isActive !== undefined ? data.isActive : true),
        isActive: data.is_active !== undefined ? data.is_active : (data.isActive !== undefined ? data.isActive : true)
      };
      
      await executiveAPI.update(selectedExecutive.id.toString(), executiveData);
      toast({
        title: "Success",
        description: "Executive updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedExecutive(null);
      fetchExecutives(); // Refresh the list
    } catch (error: any) {
      console.error("Error updating executive:", error);
      let errorMessage = 'Failed to update executive. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
          errorMessage = 'Unable to connect to the server. Please check if the backend is running.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting an executive
  const handleDeleteExecutive = async (executive: Executive) => {
    try {
      await executiveAPI.delete(executive.id.toString());
      toast({
        title: "Success",
        description: "Executive deleted successfully",
      });
      fetchExecutives(); // Refresh the list
    } catch (error: any) {
      console.error("Error deleting executive:", error);
      let errorMessage = 'Failed to delete executive. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
          errorMessage = 'Unable to connect to the server. Please check if the backend is running.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Fetch executives on component mount
  useEffect(() => {
    fetchExecutives();
  }, []);

  const getStatusBadge = (executive: Executive) => {
    // Handle both is_active and isActive properties
    const isActive = executive.is_active !== undefined ? executive.is_active : executive.isActive;
    return isActive ? (
      <Badge className="bg-status-open text-white">Active</Badge>
    ) : (
      <Badge className="bg-status-closed text-white">Inactive</Badge>
    );
  };

  const filteredExecutives = executives.filter(executive =>
    (executive.name && executive.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (executive.email && executive.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (executive.department && executive.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Function to check if error is related to database connection
  const isDatabaseError = (errorMessage: string) => {
    return errorMessage.includes('timeout') || 
           errorMessage.includes('connection') || 
           errorMessage.includes('database') ||
           errorMessage.includes('Network error');
  };

  // Define export columns
  const exportColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'department', label: 'Department' },
    { key: 'is_active', label: 'Active Status' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 border border-red-200">
          <h2 className="text-xl font-bold text-red-600 mb-2">Failed to Load Executives</h2>
          <p className="text-red-500 mb-4">{error}</p>
          {isDatabaseError(error) && (
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">
                This might be a database connection issue. Please check:
              </p>
              <ul className="text-xs text-muted-foreground list-disc list-inside mt-1">
                <li>If the backend server is running</li>
                <li>If database credentials are correct</li>
                <li>If your IP is whitelisted in cPanel</li>
              </ul>
            </div>
          )}
          <Button onClick={fetchExecutives} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Executive Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Executive</DialogTitle>
          </DialogHeader>
          <ExecutiveForm 
            onSubmit={handleAddExecutive} 
            isLoading={isSubmitting}
            submitButtonText="Add Executive"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Executive Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setSelectedExecutive(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Executive</DialogTitle>
          </DialogHeader>
          {selectedExecutive && (
            <ExecutiveForm 
              initialData={selectedExecutive}
              onSubmit={handleEditExecutive} 
              isLoading={isSubmitting}
              submitButtonText="Update Executive"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support Executives</h1>
          <p className="text-muted-foreground">
            Manage your support team and track their performance
          </p>
        </div>
        <div className="flex space-x-2">
          <ExportToExcel 
            data={executives} 
            filename="support-executives" 
            columns={exportColumns} 
          />
          <Button variant="outline" onClick={fetchExecutives}>
            Refresh
          </Button>
          <Button 
            className="bg-gradient-to-r from-primary to-primary-hover"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Executive
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{executives.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Agents</p>
                <p className="text-2xl font-bold">
                  {executives.filter(e => e.is_active !== undefined ? e.is_active : e.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assigned Tickets</p>
                <p className="text-2xl font-bold">
                  {executives.some(e => (e as any).assignedTickets !== undefined) 
                    ? executives.reduce((sum, e) => sum + ((e as any).assignedTickets || 0), 0)
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Resolved</p>
                <p className="text-2xl font-bold">
                  {executives.some(e => (e as any).resolvedTickets !== undefined) 
                    ? executives.reduce((sum, e) => sum + ((e as any).resolvedTickets || 0), 0)
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search executives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Executives Grid */}
      {filteredExecutives.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredExecutives.map((executive) => (
            <Card key={executive.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                        {executive.name ? executive.name.split(' ').map(n => n[0]).join('') : 'EX'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{executive.name || 'Unnamed Executive'}</CardTitle>
                      <CardDescription>{executive.department || 'Support Executive'}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(executive)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedExecutive(executive);
                          setIsEditDialogOpen(true);
                        }}>
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>View Tickets</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteExecutive(executive)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="mr-2 h-4 w-4" />
                    {executive.email || 'No email provided'}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-2 h-4 w-4" />
                    {executive.mobile || 'No phone provided'}
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{(executive as any).assignedTickets !== undefined ? (executive as any).assignedTickets : 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">Assigned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{(executive as any).resolvedTickets !== undefined ? (executive as any).resolvedTickets : 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">Resolved</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Assign Ticket
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No executives found</p>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your search term</p>
            <Button onClick={() => setSearchTerm("")} variant="outline">
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Executives;