"use client"

import React from "react"

import { useState, useRef } from "react"
import { Shield, FileText, Download, Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store"

export default function SettingsPage() {
  const { settings, updateSettings, updatePassword, exportData, importData } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Shop Settings State
  const [shopName, setShopName] = useState(settings.shopName)
  const [gstin, setGstin] = useState(settings.gstin)
  const [address, setAddress] = useState(settings.address)
  const [phone1, setPhone1] = useState(settings.phone1)
  const [phone2, setPhone2] = useState(settings.phone2)
  const [tagline, setTagline] = useState(settings.tagline)
  const [termsAndConditions, setTermsAndConditions] = useState(settings.termsAndConditions)
  const [settingsMessage, setSettingsMessage] = useState("")

  // Password State
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")

  const handleSaveSettings = () => {
    updateSettings({
      shopName,
      gstin,
      address,
      phone1,
      phone2,
      tagline,
      termsAndConditions,
    })
    setSettingsMessage("Settings saved successfully!")
    setTimeout(() => setSettingsMessage(""), 3000)
  }

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match!")
      return
    }
    
    const result = updatePassword(currentPassword, newPassword)
    setPasswordMessage(result.message)
    
    if (result.success) {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }
    
    setTimeout(() => setPasswordMessage(""), 3000)
  }

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `vinayak-jewellers-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        if (importData(content)) {
          alert("Data imported successfully! Please refresh the page.")
          window.location.reload()
        } else {
          alert("Failed to import data. Invalid file format.")
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your shop settings and preferences</p>
      </div>

      {/* Shop Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Shop Information
          </CardTitle>
          <p className="text-sm text-muted-foreground">Configure your shop details for invoices</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Shop Name</Label>
              <Input
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">GSTIN</Label>
              <Input
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Phone 1</Label>
              <Input
                value={phone1}
                onChange={(e) => setPhone1(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Phone 2</Label>
              <Input
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Tagline</Label>
            <Input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Address</Label>
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-input border-border text-foreground min-h-20"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Terms & Conditions</Label>
            <Textarea
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              className="bg-input border-border text-foreground min-h-20"
            />
          </div>

          {settingsMessage && (
            <p className="text-green-500 text-sm">{settingsMessage}</p>
          )}

          <Button
            onClick={handleSaveSettings}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Save System Settings
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </CardTitle>
          <p className="text-sm text-muted-foreground">Manage your account security settings</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">Current Password</Label>
            <Input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">New Password</Label>
            <Input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Confirm New Password</Label>
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>

          {passwordMessage && (
            <p className={`text-sm ${passwordMessage.includes("successfully") ? "text-green-500" : "text-destructive"}`}>
              {passwordMessage}
            </p>
          )}

          <Button
            onClick={handleChangePassword}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 bg-transparent"
          >
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Data Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">Backup and restore your shop data</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Export Data</h4>
              <p className="text-sm text-muted-foreground">Download all your shop data as backup</p>
            </div>
            <Button
              onClick={handleExport}
              variant="outline"
              className="border-border text-foreground hover:bg-muted bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Import Data</h4>
              <p className="text-sm text-muted-foreground">Restore data from a backup file</p>
            </div>
            <Button
              onClick={handleImport}
              variant="outline"
              className="border-border text-foreground hover:bg-muted bg-transparent"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
