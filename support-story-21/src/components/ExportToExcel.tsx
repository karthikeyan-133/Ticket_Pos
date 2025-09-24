import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ExportToExcelProps {
  data: any[];
  filename: string;
  columns?: { key: string; label: string }[];
}

const ExportToExcel = ({ data, filename, columns }: ExportToExcelProps) => {
  const exportToCSV = () => {
    try {
      if (!data || data.length === 0) {
        toast({
          title: "No Data",
          description: "There is no data to export.",
          variant: "destructive",
        });
        return;
      }

      // Determine columns to export
      let exportColumns = columns;
      if (!exportColumns) {
        // Auto-generate columns from the first data item
        const firstItem = data[0];
        exportColumns = Object.keys(firstItem).map(key => ({
          key,
          label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) // Convert camelCase to readable
        }));
      }

      // Create CSV content
      const headers = exportColumns.map(col => `"${col.label}"`).join(',');
      const rows = data.map(item => {
        return exportColumns.map(col => {
          const value = item[col.key];
          // Handle different data types
          if (value === null || value === undefined) {
            return '""';
          }
          if (typeof value === 'object') {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',');
      });

      const csvContent = [headers, ...rows].join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: `Data exported to ${filename}.csv`,
      });
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      Export to CSV
    </Button>
  );
};

export default ExportToExcel;