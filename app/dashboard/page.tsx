"use client"

import { Calendar, ShoppingBag, IndianRupee } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"

export default function DashboardPage() {
  const { sales } = useStore()

  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  const totalSales = sales.length
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)

  // Get recent sales (last 5)
  const recentSales = [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to Vinayak Jewellers Management System</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg border border-primary/20">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">{formattedDate}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Sales</CardTitle>
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalSales}</div>
            <p className="text-sm text-muted-foreground">Total invoices created</p>
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
            <p className="text-sm text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">Recent Sales</CardTitle>
          <p className="text-sm text-muted-foreground">Latest jewelry sales transactions</p>
        </CardHeader>
        <CardContent>
          {recentSales.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No sales data available</p>
              <p className="text-sm text-muted-foreground">Create your first sale to see it here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{sale.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">{sale.customerName || "Walk-in Customer"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground flex items-center justify-end">
                      <IndianRupee className="w-4 h-4" />
                      {sale.total.toLocaleString("en-IN")}
                    </p>
                    <p className="text-sm text-muted-foreground">{sale.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
