import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { ticketAPI } from "@/services/api";

interface TicketFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  submitButtonText?: string;
  onSerialNumberChange?: (serialNumber: string) => void;
}

const TicketForm = ({ initialData, onSubmit, isLoading, submitButtonText = "Save Ticket", onSerialNumberChange }: TicketFormProps) => {
  const [formData, setFormData] = useState({
    ticketNumber: initialData?.ticketNumber || "",
    serialNumber: initialData?.serialNumber || "",
    companyName: initialData?.companyName || "",
    contactPerson: initialData?.contactPerson || "",
    mobileNumber: initialData?.mobileNumber || "",
    email: initialData?.email || "",
    issueRelated: initialData?.issueRelated || "data",
    priority: initialData?.priority || "medium",
    assignedExecutive: initialData?.assignedExecutive || "",
    status: initialData?.status || "open",
    userType: initialData?.userType || "single user",
    expiryDate: initialData?.expiryDate || "",
    resolution: initialData?.resolution || "",
    remarks: initialData?.remarks || ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serialNumberError, setSerialNumberError] = useState("");
  const [isFetchingSerialData, setIsFetchingSerialData] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Special handling for serial number
    if (name === "serialNumber") {
      handleSerialNumberChange(value);
    }
  };

  // Handle serial number input with validation
  const handleSerialNumberChange = (value: string) => {
    // Remove any non-digit characters
    const cleanValue = value.replace(/\D/g, "");
    
    // Limit to 9 digits
    const limitedValue = cleanValue.slice(0, 9);
    
    setFormData(prev => ({ ...prev, serialNumber: limitedValue }));
    
    // Validate length
    if (limitedValue.length > 0 && limitedValue.length !== 9) {
      setSerialNumberError("Tally serial number must be exactly 9 digits");
    } else {
      setSerialNumberError("");
    }
    
    // Clear general error for serialNumber field
    if (errors.serialNumber) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.serialNumber;
        return newErrors;
      });
    }
    
    // Notify parent component of serial number change
    if (onSerialNumberChange) {
      onSerialNumberChange(limitedValue);
    }
    
    // Auto-fetch customer details when serial number is complete
    if (limitedValue.length === 9) {
      fetchCustomerDetails(limitedValue);
    }
  };

  // Fetch customer details based on serial number
  const fetchCustomerDetails = async (serialNumber: string) => {
    if (!serialNumber || serialNumber.length !== 9) return;
    
    setIsFetchingSerialData(true);
    try {
      const data = await ticketAPI.getBySerialNumber(serialNumber);
      // Only populate customer details if this is a new ticket (no initialData)
      // and if we actually received data from the API
      if (!initialData && data && Object.keys(data).length > 0) {
        setFormData(prev => ({
          ...prev,
          companyName: data.company_name || data.companyName || prev.companyName,
          contactPerson: data.contact_person || data.contactPerson || prev.contactPerson,
          mobileNumber: data.mobile_number || data.mobileNumber || prev.mobileNumber,
          email: data.email || prev.email,
          userType: data.user_type || data.userType || prev.userType,
          expiryDate: data.expiry_date || data.expiryDate || prev.expiryDate,
          assignedExecutive: data.assigned_executive || data.assignedExecutive || prev.assignedExecutive
        }));
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
    } finally {
      setIsFetchingSerialData(false);
    }
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user selects
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.serialNumber) {
      newErrors.serialNumber = "Tally serial number is required";
    } else if (formData.serialNumber.length !== 9) {
      newErrors.serialNumber = "Tally serial number must be exactly 9 digits";
    }
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }
    
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required";
    }
    
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // If we have a serial number error, don't submit
    if (serialNumberError) {
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serialNumberError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serialNumberError}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Serial Number */}
        <div className="space-y-2">
          <Label htmlFor="serialNumber">Tally Serial Number *</Label>
          <div className="relative">
            <Input
              id="serialNumber"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={(e) => handleSerialNumberChange(e.target.value)}
              placeholder="Enter 9-digit serial number"
              maxLength={9}
              className={errors.serialNumber ? "border-red-500" : ""}
            />
            {isFetchingSerialData && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
          {errors.serialNumber && (
            <p className="text-sm text-red-500">{errors.serialNumber}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Must be exactly 9 digits
          </p>
        </div>
        
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Enter company name"
            className={errors.companyName ? "border-red-500" : ""}
          />
          {errors.companyName && (
            <p className="text-sm text-red-500">{errors.companyName}</p>
          )}
        </div>
        
        {/* Contact Person */}
        <div className="space-y-2">
          <Label htmlFor="contactPerson">Contact Person *</Label>
          <Input
            id="contactPerson"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            placeholder="Enter contact person name"
            className={errors.contactPerson ? "border-red-500" : ""}
          />
          {errors.contactPerson && (
            <p className="text-sm text-red-500">{errors.contactPerson}</p>
          )}
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
            className={errors.mobileNumber ? "border-red-500" : ""}
          />
          {errors.mobileNumber && (
            <p className="text-sm text-red-500">{errors.mobileNumber}</p>
          )}
        </div>
        
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>
        
        {/* Issue Related */}
        <div className="space-y-2">
          <Label htmlFor="issueRelated">Issue Related To</Label>
          <Select 
            value={formData.issueRelated} 
            onValueChange={(value) => handleSelectChange("issueRelated", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select issue type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="data">Data Related</SelectItem>
              <SelectItem value="network">Network Related</SelectItem>
              <SelectItem value="licence">Licence Related</SelectItem>
              <SelectItem value="entry">Entry Related</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => handleSelectChange("priority", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Assigned Executive */}
        <div className="space-y-2">
          <Label htmlFor="assignedExecutive">Assigned Office Staff</Label>
          <Input
            id="assignedExecutive"
            name="assignedExecutive"
            value={formData.assignedExecutive}
            onChange={handleChange}
            placeholder="Enter assigned staff name"
          />
        </div>
        
        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => handleSelectChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="on hold">On Hold</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* User Type */}
        <div className="space-y-2">
          <Label htmlFor="userType">Licence Type</Label>
          <Select 
            value={formData.userType} 
            onValueChange={(value) => handleSelectChange("userType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select licence type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single user">Single User</SelectItem>
              <SelectItem value="multiuser">Multiuser</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Expiry Date */}
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            name="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={handleChange}
          />
        </div>
      </div>
      
      {/* Remarks */}
      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder="Enter any additional remarks"
          rows={3}
        />
      </div>
      
      {/* Resolution (only show for existing tickets) */}
      {initialData && (
        <div className="space-y-2">
          <Label htmlFor="resolution">Resolution</Label>
          <Textarea
            id="resolution"
            name="resolution"
            value={formData.resolution}
            onChange={handleChange}
            placeholder="Enter resolution details"
            rows={3}
          />
        </div>
      )}
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : submitButtonText}
      </Button>
    </form>
  );
};

export default TicketForm;