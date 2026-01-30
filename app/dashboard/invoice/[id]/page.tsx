"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

function numberToWords(num: number): string {
  if (num === 0) return "Zero"
  
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
  
  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return ""
    if (n < 20) return ones[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "")
  }
  
  const intNum = Math.floor(num)
  let result = ""
  
  if (intNum >= 10000000) {
    result += convertLessThanThousand(Math.floor(intNum / 10000000)) + " Crore "
  }
  if (intNum >= 100000) {
    result += convertLessThanThousand(Math.floor((intNum % 10000000) / 100000)) + " Lakh "
  }
  if (intNum >= 1000) {
    result += convertLessThanThousand(Math.floor((intNum % 100000) / 1000)) + " Thousand "
  }
  result += convertLessThanThousand(intNum % 1000)
  
  return result.trim() + " Rupees Only"
}

export default function InvoicePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { getSale, settings } = useStore()
  const [sale, setSale] = useState<ReturnType<typeof getSale>>(undefined)

  const shouldPrint = searchParams.get("print") === "true"

  useEffect(() => {
    const foundSale = getSale(params.id as string)
    setSale(foundSale)
  }, [params.id, getSale])

  useEffect(() => {
    if (shouldPrint && sale) {
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }, [shouldPrint, sale])

  if (!sale) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Invoice not found</p>
      </div>
    )
  }

  const saleDate = new Date(sale.date)
  const formattedTime = saleDate.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
  const formattedDate = saleDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  })

  return (
    <div className="space-y-6">
      {/* Header - hidden in print */}
      <div className="flex items-center gap-4 print:hidden">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={() => window.print()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Printer className="w-4 h-4 mr-2" />
          Print Invoice
        </Button>
      </div>

      {/* Invoice Preview */}
      <div className="bg-white rounded-lg shadow-lg overflow-auto print:shadow-none print:rounded-none">
        <div className="p-8 text-black min-w-[700px]" style={{ fontFamily: "Arial, sans-serif" }}>
          {/* Header Row - Date/Time and Invoice No */}
          <div className="flex justify-between items-start text-xs text-gray-600 mb-4">
            <p>{formattedDate}, {formattedTime}</p>
            <p>Invoice No : {sale.invoiceNumber}</p>
          </div>

          {/* GSTIN, Tagline, Contact Row */}
          <div className="flex justify-between items-start text-xs mb-2">
            <p>GSTIN No.: {settings.gstin}</p>
            <p className="text-center text-gray-600">{settings.tagline}</p>
            <div className="text-right">
              <p>Cell: {settings.phone1}</p>
              <p>{settings.phone2}</p>
            </div>
          </div>

          {/* Shop Name */}
          <div className="text-center mb-2">
            <h1 className="text-2xl font-bold text-orange-500 tracking-wide">{settings.shopName.toUpperCase()}</h1>
            <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">{settings.address}</p>
          </div>

          {/* Orange Divider */}
          <div className="border-t-4 border-orange-500 my-4"></div>

          {/* Invoice Details and Customer Details - Two Columns */}
          <div className="flex justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-orange-500 mb-2">Invoice Details</h3>
              <div className="text-xs space-y-1">
                <p><span className="font-medium">Invoice Number:</span> {sale.invoiceNumber}</p>
                <p><span className="font-medium">Date:</span> {formattedDate}</p>
                <p><span className="font-medium">Payment Method:</span> {sale.paymentMethod}</p>
                <p><span className="font-medium">Status:</span> {sale.status}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-600 mb-2">Customer Details</h3>
              <div className="text-xs space-y-1">
                <p><span className="font-medium">Name:</span> {sale.customerName || ""}</p>
                <p><span className="font-medium">Phone:</span> {sale.customerPhone || ""}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-6 text-xs">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-2 text-gray-600 font-medium">Item Description</th>
                <th className="text-center py-2 text-gray-600 font-medium">Quantity (g)</th>
                <th className="text-center py-2 text-gray-600 font-medium">Rate (&#8377;)</th>
                <th className="text-right py-2 text-gray-600 font-medium">Amount (&#8377;)</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2">{item.description || ""}</td>
                  <td className="text-center py-2">{item.quantity}g</td>
                  <td className="text-center py-2">&#8377;{item.rate}</td>
                  <td className="text-right py-2">&#8377;{item.amount.toLocaleString("en-IN")}</td>
                </tr>
              ))}
              {sale.items.length === 0 && (
                <tr className="border-b border-gray-200">
                  <td className="py-2">-</td>
                  <td className="text-center py-2">0g</td>
                  <td className="text-center py-2">&#8377;0</td>
                  <td className="text-right py-2">&#8377;0</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Terms & Conditions and Totals - Two Columns */}
          <div className="flex justify-between mb-8">
            <div className="w-1/2">
              <h4 className="text-xs font-semibold mb-2">Terms & Conditions:</h4>
              <p className="text-xs text-gray-600 whitespace-pre-line">{settings.termsAndConditions}</p>
              <div className="mt-6">
                <p className="text-xs">Rs in words: <span className="border-b border-gray-400 inline-block min-w-[200px]">{numberToWords(sale.total)}</span></p>
              </div>
            </div>
            <div className="w-1/3 text-xs">
              <div className="flex justify-between py-1">
                <span>Subtotal:</span>
                <span>&#8377;{sale.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Tax (5%):</span>
                <span>&#8377;{sale.tax.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Discount:</span>
                <span>-&#8377;{sale.discount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-300 mt-2 font-bold text-orange-500">
                <span>Total Amount:</span>
                <span>&#8377;{sale.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Signature and Seal */}
          <div className="flex justify-between items-end mt-16">
            <div className="text-center">
              <div className="border-t border-gray-400 w-40 pt-2">
                <p className="text-xs">Authorized Signature</p>
              </div>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 border-2 border-dashed border-orange-300 rounded-full flex items-center justify-center">
                <div className="text-center text-xs text-orange-400">
                  <p>SEAL</p>
                  <p>SPACE</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
            <p>1/1</p>
          </div>
        </div>
      </div>
    </div>
  )
}
