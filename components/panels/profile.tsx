"use client"

import { useState, useEffect } from "react"
import { Bell, CreditCard, Key, User, Camera, Mail, Phone, MapPin, Plus } from "lucide-react"
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PlanSmartUserProfile {
  user_id: string
  full_name: string
  email: string
  phone: string
  location: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  zip_code: string
  country: string
  notification_preferences: {
    event_updates: boolean
    vendor_messages: boolean
    marketing: boolean
  }
  communication_frequency: string
}

export function ProfilePanel() {
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<PlanSmartUserProfile>({
    user_id: '',
    full_name: '',
    email: '',
    phone: '',
    location: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    notification_preferences: {
      event_updates: false,
      vendor_messages: false,
      marketing: false
    },
    communication_frequency: 'weekly'
  });
  const { toast } = useToast()
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });
  const [paymentData, setPaymentData] = useState({
    cards: [{
      last4: '4242',
      expiry: '12/24',
      type: 'Visa'
    }]
  });

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) throw new Error("No user found");

      const db = getFirestore();
      const userProfileRef = doc(db, 'user_profiles', user.uid);
      const profileSnapshot = await getDoc(userProfileRef);

      if (profileSnapshot.exists()) {
        const data = profileSnapshot.data();
        setProfileData(prev => ({
          ...prev,
          ...data,
          user_id: user.uid,
          email: user.email || '',
          notification_preferences: {
            ...prev.notification_preferences,
            ...(data.notification_preferences || {})
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error fetching profile",
        description: "Could not load your profile data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!profileData) return;

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No user found");

      const db = getFirestore();
      const userProfileRef = doc(db, 'user_profiles', user.uid);
      
      await setDoc(userProfileRef, {
        ...profileData,
        updated_at: new Date().toISOString(),
      }, { merge: true });

      toast({
        title: "Success",
        description: "Your profile has been updated.",
      })
    } catch (error) {
      toast({
        title: "Error saving changes",
        description: "Could not save your changes. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePasswordChange = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No user found");

      // Reauthenticate user before password change
      const credential = EmailAuthProvider.credential(
        user.email!,
        securityData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, securityData.newPassword);

      toast({
        title: "Success",
        description: "Password updated successfully.",
      });

      // Clear password fields
      setSecurityData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password.",
        variant: "destructive",
      });
    }
  }

  const handleInputChange = (field: keyof PlanSmartUserProfile, value: any) => {
    console.log('Input changing:', field, value);
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6 font-aeonik">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-aeonik font-bold tracking-tight">Profile & Settings</h2>
        <Button className="font-aeonik" onClick={handleSaveChanges}>Save Changes</Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 font-aeonik">
          <TabsTrigger value="profile" className="font-aeonik">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="font-aeonik">
            <Bell className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="payment" className="font-aeonik">
            <CreditCard className="mr-2 h-4 w-4" />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="security" className="font-aeonik">
            <Key className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="font-aeonik">Personal Information</CardTitle>
              <CardDescription className="font-aeonik">Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Profile picture" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  <Camera className="mr-2 h-4 w-4" />
                  Change Avatar
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <div className="font-aeonik">Full Name</div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      className="pl-9 font-aeonik text-foreground" 
                      value={profileData.full_name} 
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="font-aeonik">Email</div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      className="pl-9 font-aeonik text-foreground" 
                      value={profileData.email} 
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="font-aeonik">Phone Number</div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      className="pl-9 font-aeonik text-foreground" 
                      value={profileData.phone} 
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="font-aeonik">Location</div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      className="pl-9 font-aeonik text-foreground" 
                      value={profileData.location} 
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="font-aeonik">Notification Preferences</CardTitle>
              <CardDescription className="font-aeonik">Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-aeonik">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-aeonik">Event updates and reminders</div>
                    <Switch 
                      id="email-events" 
                      checked={profileData.notification_preferences.event_updates} 
                      onCheckedChange={(checked: boolean) => handleInputChange('notification_preferences', {
                        ...profileData.notification_preferences,
                        event_updates: checked
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="font-aeonik">New messages from vendors</div>
                    <Switch 
                      id="email-messages" 
                      checked={profileData.notification_preferences.vendor_messages} 
                      onCheckedChange={(checked: boolean) => handleInputChange('notification_preferences', {
                        ...profileData.notification_preferences,
                        vendor_messages: checked
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="font-aeonik">Marketing emails</div>
                    <Switch 
                      id="email-marketing" 
                      checked={profileData.notification_preferences.marketing} 
                      onCheckedChange={(checked: boolean) => handleInputChange('notification_preferences', {
                        ...profileData.notification_preferences,
                        marketing: checked
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-aeonik">Communication Frequency</h3>
                <RadioGroup defaultValue="weekly" className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="daily" />
                    <div className="font-aeonik">Daily digest</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <div className="font-aeonik">Weekly summary</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="important" id="important" />
                    <div className="font-aeonik">Important updates only</div>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto font-aeonik">Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods and billing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {paymentData.cards.map((card, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-md">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-aeonik-medium">{card.type} ending in {card.last4}</p>
                        <p className="text-sm text-muted-foreground font-aeonik">Expires {card.expiry}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 font-aeonik">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Add edit card logic
                          toast({
                            title: "Edit Card",
                            description: "Card editing functionality coming soon",
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Add remove card logic
                          setPaymentData(prev => ({
                            ...prev,
                            cards: prev.cards.filter((_, i) => i !== index)
                          }));
                          toast({
                            title: "Success",
                            description: "Card removed successfully",
                          });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    // Add new card logic
                    toast({
                      title: "Add Payment Method",
                      description: "Payment method addition coming soon",
                    });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-aeonik">Billing Address</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <div className="font-aeonik">Address Line 1</div>
                    <Input 
                      className="pl-9 font-aeonik text-foreground" 
                      value={profileData.address_line1} 
                      onChange={(e) => handleInputChange('address_line1', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="font-aeonik">Address Line 2</div>
                    <Input 
                      className="pl-9 font-aeonik text-foreground" 
                      value={profileData.address_line2} 
                      onChange={(e) => handleInputChange('address_line2', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <div className="font-aeonik">City</div>
                      <Input 
                        className="pl-9 font-aeonik text-foreground" 
                        value={profileData.city} 
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="font-aeonik">State</div>
                      <Input 
                        className="pl-9 font-aeonik text-foreground" 
                        value={profileData.state} 
                        onChange={(e) => handleInputChange('state', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <div className="font-aeonik">ZIP Code</div>
                      <Input 
                        className="pl-9 font-aeonik text-foreground" 
                        value={profileData.zip_code} 
                        onChange={(e) => handleInputChange('zip_code', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="font-aeonik">Country</div>
                      <Select 
                        defaultValue={profileData.country || 'us'} 
                        onValueChange={(value: string) => handleInputChange('country', value)}
                      >
                        <SelectTrigger className="pl-9 font-aeonik">
                          <SelectValue className="font-aeonik" placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem className="font-aeonik" value="us">United States</SelectItem>
                          <SelectItem className="font-aeonik" value="ca">Canada</SelectItem>
                          <SelectItem className="font-aeonik" value="gb">United Kingdom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="ml-auto"
                onClick={handleSaveChanges}
              >
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-aeonik">Change Password</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <div className="font-aeonik">Current Password</div>
                    <Input 
                      className="font-aeonik text-foreground" 
                      type="password"
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="font-aeonik">New Password</div>
                    <Input 
                      className="font-aeonik text-foreground" 
                      type="password"
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="font-aeonik">Confirm New Password</div>
                    <Input 
                      className="font-aeonik text-foreground" 
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                    />
                  </div>
                </div>
                <Button 
                  className="font-aeonik"
                  onClick={() => {
                    if (securityData.newPassword !== securityData.confirmPassword) {
                      toast({
                        title: "Error",
                        description: "Passwords do not match",
                        variant: "destructive",
                      });
                      return;
                    }
                  }}
                >
                  Update Password
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-aeonik">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-aeonik">Enable Two-Factor Authentication</p>
                    <p className="text-sm font-aeonik text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-aeonik">Account Actions</h3>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="font-aeonik">Download My Data</Button>
                  <Button variant="outline" className="font-aeonik text-red-600 hover:text-red-700">Delete Account</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
