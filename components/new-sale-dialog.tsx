"use client"

import { useState } from "react"
import { Plus, Trash2, IndianRupee } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStore, type SaleItem } from "@/lib/store"

interface NewSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const emptyItem: SaleItem = {
  description: "",
  quantity: 0,
  rate: 0,
  amount: 0,
}

export function NewSaleDialog({ open, onOpenChange }: NewSaleDialogProps) {
  const { addSale, getNextInvoiceNumber } = useStore()
  
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card" | "UPI" | "Bank Transfer">("Cash")
  const [items, setItems] = useState<SaleItem[]>([{ ...emptyItem }])
  const [discount, setDiscount] = useState(0)
  const [status, setStatus] = useState<"Paid" | "Pending">("Paid")

  const TAX_RATE = 0.05

  const updateItem = (index: number, field: keyof SaleItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Calculate amount
    if (field === "quantity" || field === "rate") {
      const qty = field === "quantity" ? Number(value) : newItems[index].quantity
      const rate = field === "rate" ? Number(value) : newItems[index].rate
      newItems[index].amount = qty * rate
    }
    
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { ...emptyItem }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax - discount

  const handleSubmit = () => {
    const today = new Date().toISOString().split("T")[0]
    
    addSale({
      date: today,
      customerName,
      customerPhone,
      items: items.filter(item => item.description && item.amount > 0),
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      status,
    })

    // Reset form
    setCustomerName("")
    setCustomerPhone("")
    setPaymentMethod("Cash")
    setItems([{ ...emptyItem }])
    setDiscount(0)
    setStatus("Paid")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Sale</DialogTitle>
          <p className="text-sm text-muted-foreground">Invoice: {getNextInvoiceNumber()}</p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Customer Name</Label>
              <Input
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Phone Number</Label>
              <Input
                placeholder="Enter phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-foreground font-semibold">Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="border-primary text-primary hover:bg-primary/10 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 text-sm text-muted-foreground">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Qty (g)</div>
                <div className="col-span-2">Rate</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-1"></div>
              </div>

              {/* Items */}
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <Input
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={item.quantity || ""}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={item.rate || ""}
                      onChange={(e) => updateItem(index, "rate", e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="h-10 px-3 flex items-center bg-muted/50 rounded-md text-foreground">
                      <IndianRupee className="w-3 h-3 mr-1" />
                      {item.amount.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-foreground">
              <span>Subtotal:</span>
              <span className="flex items-center">
                <IndianRupee className="w-3 h-3" />
                {subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-foreground">
              <span>Tax (5%):</span>
              <span className="flex items-center">
                <IndianRupee className="w-3 h-3" />
                {tax.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between items-center text-foreground">
              <span>Discount:</span>
              <div className="flex items-center gap-2">
                <span>-</span>
                <IndianRupee className="w-3 h-3" />
                <Input
                  type="number"
                  value={discount || ""}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-24 bg-input border-border text-foreground h-8"
                />
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t border-border">
              <span>Total:</span>
              <span className="flex items-center">
                <IndianRupee className="w-4 h-4" />
                {total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              Create Sale
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
