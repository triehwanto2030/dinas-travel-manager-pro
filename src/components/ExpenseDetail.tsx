import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "recharts";
import { Input } from "@/components/ui/input";

interface ExpenseDetailProps {
    index: number;
    disabled: boolean;
    onlyOne: boolean;
    expense: {
        date: any;
        type: string;
        description: string;
        amount: number;
    };
    updateExp?: (idx: number, expFl: string, expVal: any) => void;
    deleteExp?: (idx: number) => void;
}

export const ExpenseDetail = ({index, disabled = false, onlyOne = true, expense, updateExp, deleteExp}: ExpenseDetailProps) => {
  return (
    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg">
        <div className="md:col-span-2">
        <Label>Tanggal</Label>
        <Popover>
            <PopoverTrigger asChild>
            <Button
                variant="outline"
                className={cn(
                "w-full justify-start text-left font-normal",
                !expense.date && "text-muted-foreground"
                )}
                disabled={disabled}
            >
                <Calendar className="mr-2 h-4 w-4" />
                {expense.date ? format(expense.date, "dd/MM/yyyy") : "Pilih tanggal"}
            </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
                mode="single"
                selected={expense.date}
                onSelect={(date) => updateExp(index, 'date', date)}
                initialFocus
                className="pointer-events-auto"
            />
            </PopoverContent>
        </Popover>
        </div>
        <div className="md:col-span-3">
        <Label>Jenis Biaya</Label>
        <Select 
            value={expense.type} 
            onValueChange={(value) => updateExp(index, 'type', value)}
            disabled={disabled}
        >
            <SelectTrigger>
            <SelectValue placeholder="Pilih jenis biaya" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="transport">Transport</SelectItem>
            <SelectItem value="meal">Makan</SelectItem>
            <SelectItem value="accommodation">Akomodasi</SelectItem>
            <SelectItem value="allowance">Saku</SelectItem>
            <SelectItem value="other">Lainnya</SelectItem>
            </SelectContent>
        </Select>
        </div>
        <div className="md:col-span-4">
        <Label>Keterangan</Label>
        <Input
            placeholder="Detail pengeluaran..."
            value={expense.description}
            onChange={(e) => updateExp(index, 'description', e.target.value)}
            disabled={disabled}
        />
        </div>
        <div className="md:col-span-2">
        <Label>Nominal</Label>
        <Input
            type="number"
            placeholder="0"
            value={expense.amount || ''}
            onChange={(e) => updateExp(index, 'amount', Number(e.target.value))}
            disabled={disabled}
        />
        </div>
        <div className="md:col-span-1 flex items-end">
        {!onlyOne && (
            <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => deleteExp(index)}
            disabled={disabled}
            >
            <X className="w-4 h-4" />
            </Button>
        )}
        </div>
    </div>
    );
};