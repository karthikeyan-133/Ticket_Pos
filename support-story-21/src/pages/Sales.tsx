import { useState, useEffect } from "react";
import { Search, Filter, Plus, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavLink } from "react-router-dom";
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

const Sales = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterExecutive, setFilterExecutive] = useState("all");
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executives, setExecutives] = useState<string[]>([]);

  // Fetch sales from backend
  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const salesData = await salesAPI.getAll({
        search: searchTerm,
        statusOfEnquiry: filterStatus,
        assignedExecutive: filterExecutive
      });
      
      // Ensure we always have an array
      const salesArray = Array.isArray(salesData) ? salesData : [];
      setSales(salesArray);
      
      // Extract unique executives for filter, but only if we have valid data
      if (Array.isArray(salesData) && salesData.length > 0) {
        const uniqueExecutives = Array.from(
          new Set(salesData.map(sale => sale.assignedExecutive).filter(Boolean))
        );
        setExecutives(uniqueExecutives);
      } else {
        setExecutives([]);
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sales. Please try again.';
      setError(errorMessage);
      setSales([]);
      setExecutives([]);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sales on component mount and when filters change
  useEffect(() => {
    fetchSales();
  }, [searchTerm, filterStatus, filterExecutive]);

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

  // Function to check if error is related to database connection
  const isDatabaseError = (errorMessage: string) => {
    return errorMessage.includes('timeout') || 
           errorMessage.includes('connection') || 
           errorMessage.includes('database') ||
           errorMessage.includes('Network error');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Enquiries</h1>
          <p className="text-muted-foreground">
            Manage and track all sales enquiries
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-primary to-primary-hover">
          <NavLink to="/sales/new">
            <Plus className="mr-2 h-4 w-4" />
            New Enquiry
          </NavLink>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-md text-sm bg-background w-full"
              >
                <option value="all">All Status</option>
                <option value="hot">Hot</option>
                <option value="cold">Cold</option>
                <option value="won">Won</option>
                <option value="under processing">Processing</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterExecutive}
                onChange={(e) => setFilterExecutive(e.target.value)}
                className="px-3 py-2 border border-input rounded-md text-sm bg-background w-full"
              >
                <option value="all">All Executives</option>
                {executives.map(executive => (
                  <option key={executive} value={executive}>{executive}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterExecutive("all");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Sales Enquiries ({sales.length})</CardTitle>
          <CardDescription>
            Complete list of sales enquiries with current status and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-32 bg-red-50 rounded-md border border-red-200 p-4">
              <p className="text-red-600 font-medium mb-2">Failed to load sales</p>
              <p className="text-red-500 text-sm mb-3">{error}</p>
              {isDatabaseError(error) && (
                <div className="text-center mb-3">
                  <p className="text-sm text-muted-foreground">
                    This might be a database connection issue. Please check:
                  </p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside mt-1">
                    <li>If the backend server is running</li>
                    <li>If database credentials are correct</li>
                  </ul>
                </div>
              )}
              <Button onClick={fetchSales} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Price (AED)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Enquiry Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length > 0 ? (
                  sales.map((sale) => (
                    <TableRow 
                      key={sale.id}
                      className="hover:bg-muted/50 cursor-pointer"
                    >
                      <TableCell className="font-medium text-foreground">{sale.companyName}</TableCell>
                      <TableCell className="text-foreground">{sale.customerName}</TableCell>
                      <TableCell>{sale.email}</TableCell>
                      <TableCell>{sale.productEnquired}</TableCell>
                      <TableCell>{sale.productPrice}</TableCell>
                      <TableCell>{getStatusBadge(sale.statusOfEnquiry)}</TableCell>
                      <TableCell className="text-foreground">{sale.assignedExecutive}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatToDubaiTime(sale.dateOfEnquiry)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <NavLink to={`/sales/${sale.id}`}>View Details</NavLink>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <NavLink to={`/sales/${sale.id}/edit`}>Edit Enquiry</NavLink>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Assign to Me</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No sales enquiries found. Try adjusting your search or filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;