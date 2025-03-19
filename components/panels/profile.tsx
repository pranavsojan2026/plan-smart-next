"use client"

import { useState, useEffect } from "react"
import { Bell, CreditCard, Key, User, Camera, Mail, Phone, MapPin, Plus } from "lucide-react"
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
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types' // You'll need to generate this using Supabase CLI

export function ProfilePanel() {
  const supabase = createClientComponentClient<Database>()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<Database['public']['Tables']['user_profiles']['Row'] | null>(null)

  useEffect(() => {
    getSession()
  }, [])

  const getSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Session error:', error.message)
        throw error
      }
      setSession(session)
      if (session) {
        await fetchProfile(session.user.id)
      }
    } catch (error: any) {
      console.error('Error getting session:', error.message)
      toast({
        title: "Error",
        description: error.message || "Failed to load session",
        variant: "destructive",
      })
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      setLoading(true)
      console.log('Attempting to fetch profile for user:', userId)

      // First try to get existing profile
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('Initial fetch result:', { data, error: fetchError })

      // If profile doesn't exist, create it
      if (fetchError?.code === 'PGRST116') {  // This is the "no rows returned" error code
        console.log('No profile found, creating new profile...')
        
        const newProfile = {
          id: userId,
          full_name: '',
          avatar_url: null,
          email: session?.user?.email || '',
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
          communication_frequency: 'weekly',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        console.log('Attempting to insert new profile:', newProfile)

        const { data: insertData, error: insertError } = await supabase
          .from('user_profiles')
          .insert([newProfile])
          .select()
          .single()

        if (insertError) {
          console.error('Insert error:', {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details
          })
          throw insertError
        }

        console.log('Successfully created new profile:', insertData)
        setProfile(insertData || newProfile)
      } else if (fetchError) {
        console.error('Fetch error:', {
          code: fetchError.code,
          message: fetchError.message,
          details: fetchError.details
        })
        throw fetchError
      } else {
        console.log('Found existing profile:', data)
        setProfile(data)
      }

    } catch (error: any) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error.stack
      })
      toast({
        title: "Error",
        description: `Failed to load profile: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<typeof profile>) => {
    try {
      if (!session?.user?.id) throw new Error('No user ID')

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: session.user.id,
          updated_at: new Date().toISOString(),
          ...updates
        })

      if (error) throw error

      setProfile((prev: any) => ({ ...prev, ...updates }))
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Password updated successfully",
      })
    } catch (error) {
      console.error('Error updating password:', error)
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      })
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || !event.target.files[0]) return

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${session?.user?.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      await updateProfile({ avatar_url: publicUrl })

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      })
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      })
    }
  }

  // Update the existing handleInputChange function
  const handleInputChange = (field: string, value: any) => {
    const updates = { [field]: value }
    updateProfile(updates)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>
  }

  if (!session) {
    return <div className="flex items-center justify-center h-96">Please sign in to view your profile.</div>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Profile & Settings</h2>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Bell className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="mr-2 h-4 w-4" />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="security">
            <Key className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || ''} alt="Profile picture" />
                  <AvatarFallback>{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" onClick={() => document.getElementById('avatar-upload')?.click()}>
                  <Camera className="mr-2 h-4 w-4" />
                  Change Avatar
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      className="pl-9"
                      value={profile?.full_name || ''} 
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      className="pl-9"
                      value={profile?.email || ''} 
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      className="pl-9"
                      value={profile?.phone || ''} 
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      className="pl-9"
                      value={profile?.location || ''} 
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Event updates and reminders</Label>
                    <Switch 
                      checked={profile?.notification_preferences?.event_updates || false}
                      onCheckedChange={(checked) => handleInputChange('notification_preferences', {
                        ...profile?.notification_preferences,
                        event_updates: checked
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Marketing emails</Label>
                    <Switch 
                      checked={profile?.notification_preferences?.marketing || false}
                      onCheckedChange={(checked) => handleInputChange('notification_preferences', {
                        ...profile?.notification_preferences,
                        marketing: checked
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Communication Frequency</h3>
                <RadioGroup 
                  value={profile?.communication_frequency || 'weekly'}
                  onValueChange={(value) => handleInputChange('communication_frequency', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily">Daily digest</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly">Weekly summary</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="important" id="important" />
                    <Label htmlFor="important">Important updates only</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
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
                <h3 className="text-lg font-medium">Change Password</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Current Password</Label>
                    <Input type="password" />
                  </div>
                  <div className="grid gap-2">
                    <Label>New Password</Label>
                    <Input type="password" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Confirm New Password</Label>
                    <Input type="password" />
                  </div>
                </div>
                <Button>Update Password</Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
