"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, ShoppingCart, IndianRupee, FileText, Eye, Download, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import { NewSaleDialog } from "@/components/new-sale-dialog"
import { openInvoicePrintWindow } from "@/lib/invoice-generator"

export default function SalesPage() {
  const { sales, deleteSale, settings } = useStore()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewSale, setShowNewSale] = useState(false)

  const totalSales = sales.length
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
  const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0

  const filteredSales = sales.filter((sale) => {
    const query = searchQuery.toLowerCase()
    return (
      sale.invoiceNumber.toLowerCase().includes(query) ||
      sale.customerName.toLowerCase().includes(query) ||
      sale.customerPhone.includes(query)
    )
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleView = (id: string) => {
    router.push(`/dashboard/invoice/${id}`)
  }

  const handlePrint = (id: string) => {
    const sale = sales.find(s => s.id === id)
    if (sale) {
      openInvoicePrintWindow(sale, {
        shopName: settings.shopName,
        gstin: settings.gstin,
        phone: settings.phone,
        altPhone: settings.altPhone || "89706 05030",
        address: settings.address
      })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this sale?")) {
      deleteSale(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales & Invoice</h1>
          <p className="text-muted-foreground">Create sales invoices and manage transactions</p>
        </div>
        <Button
          onClick={() => setShowNewSale(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Sale
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Sales</CardTitle>
            <ShoppingCart className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalSales}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Revenue</CardTitle>
            <IndianRupee className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground flex items-center">
              <IndianRupee className="w-6 h-6" />
              {totalRevenue.toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Avg Sale Value</CardTitle>
            <FileText className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground flex items-center">
              <IndianRupee className="w-6 h-6" />
              {avgSaleValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search sales by customer name, invoice number, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Sales History */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">Sales History</CardTitle>
          <p className="text-sm text-muted-foreground">View and manage all sales transactions</p>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No sales data available</p>
              <p className="text-sm text-muted-foreground">Create your first sale to see it here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Invoice</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Customer</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Items</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Total</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Payment</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="py-3 px-4 text-foreground font-medium">{sale.invoiceNumber}</td>
                      <td className="py-3 px-4 text-foreground">{sale.customerName || "-"}</td>
                      <td className="py-3 px-4 text-foreground">{sale.date}</td>
                      <td className="py-3 px-4 text-foreground">{sale.items.length} item(s)</td>
                      <td className="py-3 px-4 text-foreground flex items-center">
                        <IndianRupee className="w-3 h-3" />
                        {sale.total.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-foreground">{sale.paymentMethod}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={sale.status === "Paid" ? "outline" : "destructive"}
                          className={sale.status === "Paid" ? "border-green-500 text-green-500" : ""}
                        >
                          {sale.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(sale.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePrint(sale.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(sale.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Sale Dialog */}
      <NewSaleDialog open={showNewSale} onOpenChange={setShowNewSale} />
    </div>
  )
}
