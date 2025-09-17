import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NavLink, useNavigate } from "react-router-dom";
import { salesAPI } from "@/services/salesApi";
import { executiveAPI } from "@/services/api";
import { toast } from "@/components/ui/use-toast";

const NewSale = () => {
  const navigate = useNavigate();
  const [executives, setExecutives] = useState<any[]>([]);
  const [loadingExecutives, setLoadingExecutives] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: "",
    customerName: "",
    email: "",
    mobileNumber: "",
    productEnquired: "",
    productPrice: "",
    assignedExecutive: "",
    dateOfEnquiry: new Date().toISOString().split('T')[0],
    nextFollowUpDate: "",
    lastCallDetails: "",
    statusOfEnquiry: "hot",
    documents: ""
  });

  // Fetch executives
  const fetchExecutives = async () => {
    try {
      setLoadingExecutives(true);
      const response = await executiveAPI.getAll();
      setExecutives(response);
    } catch (error) {
      console.error("Error fetching executives:", error);
      toast({
        title: "Error",
        description: "Failed to fetch executives. Using default list.",
        variant: "destructive",
      });
      // Fallback to default executives
      setExecutives([
        { name: "John Smith" },
        { name: "Sarah Johnson" },
        { name: "Mike Wilson" },
        { name: "Anna Davis" },
        { name: "Robert Brown" },
      ]);
    } finally {
      setLoadingExecutives(false);
    }
  };

  // Load executives on component mount
  useEffect(() => {
    fetchExecutives();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await salesAPI.create({
        companyName: formData.companyName,
        customerName: formData.customerName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        productEnquired: formData.productEnquired,
        productPrice: parseFloat(formData.productPrice) || 0,
        assignedExecutive: formData.assignedExecutive,
        dateOfEnquiry: formData.dateOfEnquiry,
        nextFollowUpDate: formData.nextFollowUpDate,
        lastCallDetails: formData.lastCallDetails,
        statusOfEnquiry: formData.statusOfEnquiry as any,
        documents: formData.documents
      });
      
      toast({
        title: "Success",
        description: "Sales enquiry created successfully.",
      });
      
      navigate("/sales");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create sales enquiry.",
        variant: "destructive",
      });
      console.error("Error creating sale:", error);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-foreground">New Sales Enquiry</h1>
          <p className="text-muted-foreground">
            Create a new sales enquiry record
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Enquiry Details</CardTitle>
          <CardDescription>
            Enter all the required information for the new sales enquiry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  required
                />
              </div>

              {/* Customer Name */}
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  required
                />
              </div>

              {/* Email ID */}
              <div className="space-y-2">
                <Label htmlFor="email">Email ID *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  required
                />
              </div>

              {/* Product Enquired */}
              <div className="space-y-2">
                <Label htmlFor="productEnquired">Product Enquired *</Label>
                <Input
                  id="productEnquired"
                  name="productEnquired"
                  value={formData.productEnquired}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Product Price (AED) */}
              <div className="space-y-2">
                <Label htmlFor="productPrice">Product Price (AED) *</Label>
                <Input
                  id="productPrice"
                  name="productPrice"
                  type="number"
                  value={formData.productPrice}
                  onChange={handleChange}
                  placeholder="Enter product price"
                  required
                />
              </div>

              {/* Assigned Executive/Team */}
              <div className="space-y-2">
                <Label htmlFor="assignedExecutive">Assigned Executive/Team *</Label>
                <Select
                  value={formData.assignedExecutive}
                  onValueChange={(value) => handleSelectChange("assignedExecutive", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select executive" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingExecutives ? (
                      <SelectItem value="loading" disabled>Loading executives...</SelectItem>
                    ) : (
                      executives.map((executive) => (
                        <SelectItem key={executive.id || executive.name} value={executive.name}>
                          {executive.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Status of Enquiry */}
              <div className="space-y-2">
                <Label htmlFor="statusOfEnquiry">Status of Enquiry *</Label>
                <Select
                  value={formData.statusOfEnquiry}
                  onValueChange={(value) => handleSelectChange("statusOfEnquiry", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="under processing">Under Processing</SelectItem>
                    <SelectItem value="dropped">Dropped</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date of Enquiry */}
              <div className="space-y-2">
                <Label htmlFor="dateOfEnquiry">Date of Enquiry *</Label>
                <Input
                  id="dateOfEnquiry"
                  name="dateOfEnquiry"
                  type="date"
                  value={formData.dateOfEnquiry}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Next Follow-up Date */}
              <div className="space-y-2">
                <Label htmlFor="nextFollowUpDate">Next Follow-up Date</Label>
                <Input
                  id="nextFollowUpDate"
                  name="nextFollowUpDate"
                  type="date"
                  value={formData.nextFollowUpDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Last Call/Message Details */}
            <div className="space-y-2">
              <Label htmlFor="lastCallDetails">Last Call/Message Details</Label>
              <Textarea
                id="lastCallDetails"
                name="lastCallDetails"
                value={formData.lastCallDetails}
                onChange={handleChange}
                placeholder="Enter details of last call or message"
                rows={3}
              />
            </div>

            {/* Documents (Links) */}
            <div className="space-y-2">
              <Label htmlFor="documents">Documents (Links)</Label>
              <Input
                id="documents"
                name="documents"
                value={formData.documents}
                onChange={handleChange}
                placeholder="Enter document links (comma separated)"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-primary to-primary-hover">
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Enquiry
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewSale;