import type { Sale } from "./store"

function numberToWords(num: number): string {
  if (num === 0) return "Zero"
  
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
  
  function convertLessThanThousand(n: number): string {
    if (n === 0) return ""
    if (n < 20) return ones[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "")
  }
  
  if (num < 1000) return convertLessThanThousand(num)
  if (num < 100000) {
    const thousands = Math.floor(num / 1000)
    const remainder = num % 1000
    return convertLessThanThousand(thousands) + " Thousand" + (remainder !== 0 ? " " + convertLessThanThousand(remainder) : "")
  }
  if (num < 10000000) {
    const lakhs = Math.floor(num / 100000)
    const remainder = num % 100000
    return convertLessThanThousand(lakhs) + " Lakh" + (remainder !== 0 ? " " + numberToWords(remainder) : "")
  }
  const crores = Math.floor(num / 10000000)
  const remainder = num % 10000000
  return convertLessThanThousand(crores) + " Crore" + (remainder !== 0 ? " " + numberToWords(remainder) : "")
}

export function generateInvoiceHTML(sale: Sale, settings: {
  shopName: string
  gstin: string
  phone: string
  altPhone: string
  address: string
}): string {
  const now = new Date()
  const dateTime = `${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`
  const rsInWords = numberToWords(Math.round(sale.total)) + " Rupees Only"
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice - ${sale.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 10mm; }
    body { 
      font-family: Arial, sans-serif; 
      padding: 20px; 
      color: #333; 
      background: white;
      max-width: 210mm;
      margin: 0 auto;
    }
    
    /* Top Row - Date/Time and Invoice Number */
    .top-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #666;
      margin-bottom: 10px;
    }
    
    /* Header Row - GSTIN, Tagline, Contact */
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      margin-bottom: 15px;
    }
    .gstin { font-weight: 500; }
    .tagline { text-align: center; font-style: italic; }
    .contact { text-align: right; color: #0066cc; }
    
    /* Company Name */
    .company-name {
      text-align: center;
      font-size: 28px;
      font-weight: bold;
      color: #d97706;
      margin-bottom: 5px;
    }
    
    /* Address */
    .address {
      text-align: center;
      font-size: 12px;
      color: #666;
      margin-bottom: 20px;
      line-height: 1.4;
    }
    
    /* Orange Divider */
    .divider {
      height: 3px;
      background: #d97706;
      margin-bottom: 20px;
    }
    
    /* Invoice & Customer Details */
    .details-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 25px;
    }
    .details-section { width: 48%; }
    .details-section h3 {
      color: #d97706;
      font-size: 14px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .details-section p {
      font-size: 13px;
      margin-bottom: 5px;
    }
    .details-section strong { font-weight: 600; }
    
    /* Items Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    .items-table th {
      border-bottom: 2px solid #d97706;
      padding: 10px 8px;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      color: #333;
    }
    .items-table td {
      padding: 10px 8px;
      border-bottom: 1px solid #eee;
      font-size: 13px;
    }
    
    /* Bottom Section - Terms & Totals */
    .bottom-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    .terms {
      width: 55%;
    }
    .terms h4 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .terms p {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }
    .terms .rs-words {
      margin-top: 15px;
      font-size: 12px;
    }
    .terms .underline {
      border-bottom: 1px solid #333;
      display: inline-block;
      min-width: 200px;
      margin-left: 5px;
    }
    
    .totals {
      width: 40%;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
    }
    .total-row.final {
      border-top: 2px solid #d97706;
      margin-top: 5px;
      padding-top: 10px;
      font-weight: bold;
      font-size: 15px;
      color: #d97706;
    }
    
    /* Footer - Signature & Seal */
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 50px;
      padding-top: 20px;
    }
    .signature {
      text-align: center;
    }
    .signature-line {
      border-bottom: 1px solid #333;
      width: 180px;
      margin-bottom: 5px;
    }
    .signature-text {
      font-size: 12px;
      color: #666;
    }
    .seal {
      width: 100px;
      height: 100px;
      border: 2px dashed #d97706;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .seal-text {
      text-align: center;
      font-size: 12px;
      color: #999;
      line-height: 1.3;
    }
    
    /* Page Number */
    .page-number {
      text-align: center;
      font-size: 11px;
      color: #999;
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px solid #eee;
    }
    
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <!-- Top Row -->
  <div class="top-row">
    <span>${dateTime}</span>
    <span>Invoice No : ${sale.invoiceNumber}</span>
  </div>
  
  <!-- Header Row -->
  <div class="header-row">
    <div class="gstin">GSTIN No.: ${settings.gstin}</div>
    <div class="tagline">|| Shri Kalikadevi Prasanna ||</div>
    <div class="contact">Cell: ${settings.phone}<br>${settings.altPhone}</div>
  </div>
  
  <!-- Company Name -->
  <div class="company-name">${settings.shopName.toUpperCase()}</div>
  
  <!-- Address -->
  <div class="address">
    ${settings.address}
  </div>
  
  <!-- Orange Divider -->
  <div class="divider"></div>
  
  <!-- Invoice & Customer Details -->
  <div class="details-row">
    <div class="details-section">
      <h3>Invoice Details</h3>
      <p><strong>Invoice Number:</strong> ${sale.invoiceNumber}</p>
      <p><strong>Date:</strong> ${new Date(sale.date).toLocaleDateString('en-IN')}</p>
      <p><strong>Payment Method:</strong> ${sale.paymentMethod}</p>
      <p><strong>Status:</strong> ${sale.status}</p>
    </div>
    <div class="details-section">
      <h3>Customer Details</h3>
      <p><strong>Name:</strong> ${sale.customerName || '-'}</p>
      <p><strong>Phone:</strong> ${sale.customerPhone || '-'}</p>
    </div>
  </div>
  
  <!-- Items Table -->
  <table class="items-table">
    <thead>
      <tr>
        <th>Item Description</th>
        <th>Quantity (g)</th>
        <th>Rate (₹)</th>
        <th>Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${sale.items.map(item => `
        <tr>
          <td>${item.itemName || '-'}</td>
          <td>${item.quantity}g</td>
          <td>₹${item.price.toLocaleString('en-IN')}</td>
          <td>₹${item.total.toLocaleString('en-IN')}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <!-- Bottom Section -->
  <div class="bottom-section">
    <div class="terms">
      <h4>Terms & Conditions:</h4>
      <p>* Replace in only 7 days</p>
      <p class="rs-words">Rs in words: <span class="underline">${rsInWords}</span></p>
      <p><span class="underline" style="min-width: 250px;">&nbsp;</span></p>
    </div>
    <div class="totals">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>₹${sale.subtotal.toLocaleString('en-IN')}</span>
      </div>
      <div class="total-row">
        <span>Tax (5%):</span>
        <span>₹${sale.tax.toLocaleString('en-IN')}</span>
      </div>
      <div class="total-row">
        <span>Discount:</span>
        <span>-₹${sale.discount.toLocaleString('en-IN')}</span>
      </div>
      <div class="total-row final">
        <span>Total Amount:</span>
        <span>₹${sale.total.toLocaleString('en-IN')}</span>
      </div>
    </div>
  </div>
  
  <!-- Footer -->
  <div class="footer">
    <div class="signature">
      <div class="signature-line"></div>
      <div class="signature-text">Authorized Signature</div>
    </div>
    <div class="seal">
      <div class="seal-text">SEAL<br>SPACE</div>
    </div>
  </div>
  
  <!-- Page Number -->
  <div class="page-number">1/1</div>
  
  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>`
}

export function openInvoicePrintWindow(sale: Sale, settings: {
  shopName: string
  gstin: string
  phone: string
  altPhone: string
  address: string
}): void {
  const html = generateInvoiceHTML(sale, settings)
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
  }
}
