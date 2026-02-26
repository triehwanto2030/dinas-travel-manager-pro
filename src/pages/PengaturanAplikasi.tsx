
import React, { useState, useEffect } from 'react';
import { Save, Database, Mail, Bell, Shield, Globe, Palette } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAppSettings, useSaveAppSettings } from '@/hooks/useAppSettings';

const PengaturanAplikasi = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const { data: savedSettings, isLoading } = useAppSettings();
  const saveSettings = useSaveAppSettings();

  const [settings, setSettings] = useState({
    appName: 'Travel Pro',
    appDescription: 'Sistem Manajemen Perjalanan Dinas',
    companyName: 'PT. Example Company',
    companyAddress: 'Jl. Contoh No. 123, Jakarta',
    emailNotifications: true,
    pushNotifications: false,
    autoApproval: false,
    maxBudget: 5000000,
    currency: 'IDR',
    language: 'id',
    timezone: 'Asia/Jakarta',
    theme: 'light'
  });
  
  // Load saved settings
  useEffect(() => {
    if (savedSettings) {
      setSettings(prev => ({
        ...prev,
        appName: savedSettings.appName || prev.appName,
        appDescription: savedSettings.appDescription || prev.appDescription,
        companyName: savedSettings.companyName || prev.companyName,
        companyAddress: savedSettings.companyAddress || prev.companyAddress,
        emailNotifications: savedSettings.emailNotifications === 'true',
        pushNotifications: savedSettings.pushNotifications === 'true',
        autoApproval: savedSettings.autoApproval === 'true',
        maxBudget: Number(savedSettings.maxBudget) || prev.maxBudget,
        currency: savedSettings.currency || prev.currency,
        language: savedSettings.language || prev.language,
        timezone: savedSettings.timezone || prev.timezone,
        theme: savedSettings.theme || prev.theme,
      }));
    }
  }, [savedSettings]);

  const handleSave = async () => {
    try {
      await saveSettings.mutateAsync({
        appName: settings.appName,
        appDescription: settings.appDescription,
        companyName: settings.companyName,
        companyAddress: settings.companyAddress,
        emailNotifications: String(settings.emailNotifications),
        pushNotifications: String(settings.pushNotifications),
        autoApproval: String(settings.autoApproval),
        maxBudget: String(settings.maxBudget),
        currency: settings.currency,
        language: settings.language,
        timezone: settings.timezone,
        theme: settings.theme,
      });
      toast({
        title: "Berhasil!",
        description: "Pengaturan aplikasi berhasil disimpan",
      });
    } catch (err: any) {
      toast({
        title: "Error!",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setSettings({
      appName: 'Travel Pro',
      appDescription: 'Sistem Manajemen Perjalanan Dinas',
      companyName: 'PT. Example Company',
      companyAddress: 'Jl. Contoh No. 123, Jakarta',
      emailNotifications: true,
      pushNotifications: false,
      autoApproval: false,
      maxBudget: 5000000,
      currency: 'IDR',
      language: 'id',
      timezone: 'Asia/Jakarta',
      theme: 'light'
    });

    toast({
      title: "Reset!",
      description: "Pengaturan dikembalikan ke default",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors w-full">
      <Header />
      
      <div className="flex w-full">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex-1 w-full">
          <main className="p-6 w-full">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pengaturan Aplikasi</h1>
                  <p className="text-gray-600 dark:text-gray-400">Konfigurasi sistem dan preferensi aplikasi</p>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                  <Button variant="outline" onClick={handleReset}>
                    Reset Default
                  </Button>
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={saveSettings.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                      {saveSettings.isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Pengaturan Umum
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="appName">Nama Aplikasi</Label>
                    <Input
                      id="appName"
                      value={settings.appName}
                      onChange={(e) => setSettings({...settings, appName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="appDescription">Deskripsi</Label>
                    <Textarea
                      id="appDescription"
                      value={settings.appDescription}
                      onChange={(e) => setSettings({...settings, appDescription: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Nama Perusahaan</Label>
                    <Input
                      id="companyName"
                      value={settings.companyName}
                      onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyAddress">Alamat Perusahaan</Label>
                    <Textarea
                      id="companyAddress"
                      value={settings.companyAddress}
                      onChange={(e) => setSettings({...settings, companyAddress: e.target.value})}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* System Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Pengaturan Sistem
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currency">Mata Uang</Label>
                    <Select value={settings.currency} onValueChange={(value) => setSettings({...settings, currency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IDR">IDR - Indonesian Rupiah</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Bahasa</Label>
                    <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">Bahasa Indonesia</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => setSettings({...settings, timezone: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                        <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
                        <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxBudget">Max Budget Per Trip</Label>
                    <Input
                      id="maxBudget"
                      type="number"
                      value={settings.maxBudget}
                      onChange={(e) => setSettings({...settings, maxBudget: Number(e.target.value)})}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Pengaturan Notifikasi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div><Label>In-App Notifications</Label><p className="text-sm text-gray-500">Tampilkan notifikasi di dalam aplikasi</p></div>
                    <Switch checked={settings.pushNotifications} onCheckedChange={(v) => setSettings({...settings, pushNotifications: v})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Kirim notifikasi via email (memerlukan integrasi email service)</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Catatan: Email notification memerlukan integrasi layanan email pihak ketiga (seperti Resend/SendGrid).</p>
                </CardContent>
              </Card>

              {/* Business Rules */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Aturan Bisnis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Approval</Label>
                      <p className="text-sm text-gray-500">Otomatis approve trip di bawah budget tertentu</p>
                    </div>
                    <Switch
                      checked={settings.autoApproval}
                      onCheckedChange={(checked) => setSettings({...settings, autoApproval: checked})}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Appearance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Tampilan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={settings.theme} onValueChange={(value) => setSettings({...settings, theme: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
          
          <Footer />
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-40"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  );
};

export default PengaturanAplikasi;
