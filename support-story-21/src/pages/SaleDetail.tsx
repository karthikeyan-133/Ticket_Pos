import { useState, useEffect } from "react";
import { ArrowLeft, Edit, Calendar, Phone, Mail, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import { salesAPI } from "@/services/salesApi";
import { toast } from "@/components/ui/use-toast";

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

// Format date to display only date (without time)
const formatDate = (dateString: string) => {
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
      day: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

const SaleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sale details
  const fetchSale = async () => {
    try {
      setLoading(true);
      setError(null);
      const saleData = await salesAPI.getById(id!);
      setSale(saleData);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sale details.';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error fetching sale:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sale on component mount
  useEffect(() => {
    if (id) {
      fetchSale();
    }
  }, [id]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      hot: { label: "Hot", className: "bg-red-500 text-white" },
      cold: { label: "Cold", className: "bg-blue-500 text-white" },
      won: { label: "Won", className: "bg-green-500 text-white" },
      "under processing": { label: "Processing", className: "bg-yellow-500 text-white" },
      dropped: { label: "Dropped", className: "bg-gray-500 text-white" }
    };
    
    const config = statusConfig[status];
    return config ? (
      <Badge className={config.className}>{config.label}</Badge>
    ) : (
      <Badge>{status}</Badge>
    );
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm("Are you sure you want to delete this sales enquiry?")) {
      try {
        await salesAPI.delete(id);
        toast({
          title: "Success",
          description: "Sales enquiry deleted successfully.",
        });
        navigate("/sales");
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete sales enquiry.",
          variant: "destructive",
        });
        console.error("Error deleting sale:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-md border border-red-200 p-4">
        <p className="text-red-600 font-medium mb-2">Failed to load sales enquiry</p>
        <p className="text-red-500 text-sm mb-3">{error}</p>
        <div className="flex space-x-2">
          <Button onClick={fetchSale} variant="outline" size="sm">
            Retry
          </Button>
          <Button asChild variant="outline" size="sm">
            <NavLink to="/sales">Back to Sales</NavLink>
          </Button>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">Sales enquiry not found</p>
        <Button asChild variant="outline" size="sm" className="mt-2">
          <NavLink to="/sales">Back to Sales</NavLink>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button asChild variant="outline" size="sm" className="mb-2">
            <NavLink to="/sales">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sales
            </NavLink>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Sales Enquiry Details</h1>
          <p className="text-muted-foreground">
            View and manage sales enquiry information
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <NavLink to={`/sales/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </NavLink>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sale Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{sale.companyName}</CardTitle>
                  <CardDescription>
                    Customer: {sale.customerName}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(sale.statusOfEnquiry)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Email ID</Label>
                  <p className="font-medium">{sale.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Mobile Number</Label>
                  <p className="font-medium">{sale.mobileNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Product Enquired</Label>
                  <p className="font-medium">{sale.productEnquired}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Product Price (AED)</Label>
                  <p className="font-medium">{sale.productPrice}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Assigned Executive/Team</Label>
                  <p className="font-medium">{sale.assignedExecutive}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date of Enquiry</Label>
                  <p className="font-medium">{formatDate(sale.dateOfEnquiry)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Next Follow-up Date</Label>
                  <p className="font-medium">{formatDate(sale.nextFollowUpDate) || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Last Call/Message Details</Label>
                <p className="font-medium mt-1">{sale.lastCallDetails || 'N/A'}</p>
              </div>
              
              {sale.documents && (
                <div>
                  <Label className="text-muted-foreground">Documents</Label>
                  <div className="mt-1">
                    {sale.documents.split(',').map((doc: string, index: number) => (
                      <a 
                        key={index} 
                        href={doc.trim()} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:underline mr-4"
                      >
                        <FileText className="mr-1 h-4 w-4" />
                        Document {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                <span>{sale.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                <span>{sale.mobileNumber}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                <span>Enquiry Date: {formatDate(sale.dateOfEnquiry)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{formatToDubaiTime(sale.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{formatToDubaiTime(sale.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SaleDetail;