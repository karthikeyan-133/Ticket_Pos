import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/components/ui/use-toast";
import { executiveAPI, ticketAPI } from "@/services/api";

// Define the form schema with Zod
const ticketFormSchema = z.object({
  serialNumber: z
    .string()
    .min(9, "Serial number must be exactly 9 digits")
    .max(9, "Serial number must be exactly 9 digits")
    .regex(/^\d+$/, "Serial number must contain only digits"),
  companyName: z.string().min(1, "Company name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  mobileNumber: z
    .string()
    .min(10, "Mobile number must be at least 10 digits")
    .regex(/^\d+$/, "Mobile number must contain only digits"),
  email: z.string().email("Invalid email address"),
  issueRelated: z.enum(["data", "network", "licence", "entry"]),
  priority: z.enum(["high", "medium", "low"]),
  assignedExecutive: z.string().min(1, "Please assign to an executive"),
  status: z.enum(["open", "closed", "processing", "on hold"]),
  userType: z.enum(["single user", "multiuser"]),
  expiryDate: z.date({
    required_error: "Expiry date is required",
  }),
  resolution: z.string().optional(),
  remarks: z.string().optional(),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

interface TicketFormProps {
  initialData?: Partial<TicketFormValues>;
  onSubmit: (data: TicketFormValues) => void;
  isLoading: boolean;
  submitButtonText?: string;
}

export function TicketForm({ 
  initialData, 
  onSubmit, 
  isLoading,
  submitButtonText = "Submit"
}: TicketFormProps) {
  const [executives, setExecutives] = useState<any[]>([]);
  const [loadingExecutives, setLoadingExecutives] = useState(true);
  const [previousCompanyName, setPreviousCompanyName] = useState("");
  const [isCheckingSerial, setIsCheckingSerial] = useState(false);

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

  // Initialize form with react-hook-form and zod validation
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      serialNumber: initialData?.serialNumber || "",
      companyName: initialData?.companyName || "",
      contactPerson: initialData?.contactPerson || "",
      mobileNumber: initialData?.mobileNumber || "",
      email: initialData?.email || "",
      issueRelated: (initialData?.issueRelated as "data" | "network" | "licence" | "entry") || "data",
      priority: (initialData?.priority as "high" | "medium" | "low") || "medium",
      assignedExecutive: initialData?.assignedExecutive || "",
      status: (initialData?.status as "open" | "closed" | "processing" | "on hold") || "open",
      userType: (initialData?.userType as "single user" | "multiuser") || "single user",
      expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate) : undefined,
      resolution: initialData?.resolution || "",
      remarks: initialData?.remarks || "",
    },
  });

  // Function to check for existing tickets with the same serial number
  const checkSerialNumber = async (serialNumber: string) => {
    if (!serialNumber || serialNumber.length !== 9) return;
    
    setIsCheckingSerial(true);
    try {
      const tickets = await ticketAPI.getBySerialNumber(serialNumber);
      if (tickets && tickets.length > 0) {
        // Get the company name from the most recent ticket
        const latestTicket = tickets[0]; // Tickets are ordered by date, so first one is latest
        if (latestTicket.company_name) {
          form.setValue("companyName", latestTicket.company_name);
          setPreviousCompanyName(latestTicket.company_name);
          toast({
            title: "Company Information Found",
            description: `Company name automatically populated from previous ticket with the same serial number.`,
          });
        }
      }
    } catch (error) {
      console.error("Error checking serial number:", error);
    } finally {
      setIsCheckingSerial(false);
    }
  };

  // Watch for changes to the serial number field
  const serialNumberValue = form.watch("serialNumber");
  
  useEffect(() => {
    // Only check if we have a complete serial number and it's different from what we've already checked
    if (serialNumberValue && serialNumberValue.length === 9 && serialNumberValue !== initialData?.serialNumber) {
      const timeoutId = setTimeout(() => {
        checkSerialNumber(serialNumberValue);
      }, 500); // Debounce the API call
      
      return () => clearTimeout(timeoutId);
    }
  }, [serialNumberValue]);

  // Validate serial number (sum of digits reduces to 9)
  const validateSerialNumber = (serial: string): boolean => {
    if (serial.length !== 9 || !/^\d+$/.test(serial)) return false;
    
    let sum = serial
      .split("")
      .reduce((acc, digit) => acc + parseInt(digit), 0);
      
    while (sum > 9) {
      sum = sum
        .toString()
        .split("")
        .reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    
    return sum === 9;
  };

  // Handle form submission
  const handleSubmit = (data: TicketFormValues) => {
    // Validate serial number
    if (!validateSerialNumber(data.serialNumber)) {
      toast({
        title: "Invalid Serial Number",
        description: "The sum of the serial's digits must reduce to 9.",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tally Serial Number */}
          <FormField
            control={form.control}
            name="serialNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tally Serial Number *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter 9-digit serial number" 
                    {...field}
                    maxLength={9}
                  />
                </FormControl>
                <FormDescription>
                  Must be 9 digits with digits sum reducing to 9
                  {isCheckingSerial && <span className="ml-2 text-primary">Checking...</span>}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Company Name */}
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter company name" 
                    {...field}
                  />
                </FormControl>
                {previousCompanyName && (
                  <FormDescription>
                    Auto-filled from previous ticket with same serial number
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact Person */}
          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contacted Person *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contact person name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mobile Number */}
          <FormField
            control={form.control}
            name="mobileNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter mobile number" 
                    {...field}
                    type="tel"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email ID *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter email address" 
                    {...field}
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Issue Related Section */}
          <FormField
            control={form.control}
            name="issueRelated"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Related To *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="data">Data Related</SelectItem>
                    <SelectItem value="network">Network Related</SelectItem>
                    <SelectItem value="licence">Licence Related</SelectItem>
                    <SelectItem value="entry">Entry Related</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Priority */}
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Assigned Executive */}
          <FormField
            control={form.control}
            name="assignedExecutive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned Office Staff *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={loadingExecutives}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select executive" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {executives.map((executive) => (
                      <SelectItem key={executive.name} value={executive.name}>
                        {executive.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {loadingExecutives && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Loading executives...
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="on hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* User Type */}
          <FormField
            control={form.control}
            name="userType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Licence Type *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select licence type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="single user">Single User</SelectItem>
                    <SelectItem value="multiuser">Multiuser</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Expiry Date */}
          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expiry Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Resolution */}
        <FormField
          control={form.control}
          name="resolution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resolution</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter resolution details (if closed)"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remarks */}
        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remarks</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter additional remarks..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Processing..." : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}