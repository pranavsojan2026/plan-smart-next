"use client"

// Replace Firebase imports with Supabase
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from 'next/navigation'
// Remove Firebase imports
// import { getAuth } from 'firebase/auth'
// import { getFirestore, collection, addDoc } from 'firebase/firestore'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
// Remove this line as it's duplicated
// import { Calendar as CalendarIcon } from "lucide-react"

// Keep this import where you import other Lucide icons
import { CalendarIcon, Clock } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const formSchema = z.object({
  eventName: z.string().min(2, {
    message: "Event name must be at least 2 characters.",
  }),
  eventType: z.string({
    required_error: "Please select an event type.",
  }),
  venue: z.enum(["indoor", "outdoor"], {
    required_error: "Please select a venue type.",
  }),
  eventDate: z.date({
    required_error: "Event date is required.",
  }),
  eventTime: z.string({
    required_error: "Event time is required.",
  }),
  budget: z.coerce.number().min(0, {
    message: "Budget must be at least 0.",
  }),
  guests: z.coerce.number().min(1, {
    message: "Number of guests must be at least 1.",
  }),
  vegGuests: z.coerce.number().min(0, {
    message: "Number of vegetarian guests must be at least 0.",
  }),
  nonVegGuests: z.coerce.number().min(0, {
    message: "Number of non-vegetarian guests must be at least 0.",
  }),
  additionalRequirements: z.string().optional(),
}).refine(data => data.vegGuests + data.nonVegGuests === data.guests, {
  message: "Total of vegetarian and non-vegetarian guests must equal total number of guests",
  path: ["nonVegGuests"]
});

export function NewEventForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventName: "",
      eventType: "",
      venue: "indoor",
      eventDate: undefined,
      eventTime: "",
      budget: undefined,
      guests: undefined,
      vegGuests: 0,
      nonVegGuests: 0,
      additionalRequirements: "",
    },
  })

  // Watch the guests field to update food preference validation
  const totalGuests = form.watch("guests");
  
  // Auto-update non-veg guests when veg guests change
  const vegGuests = form.watch("vegGuests");
  const updateNonVegGuests = (vegValue: number) => {
    if (totalGuests && vegValue !== undefined) {
      form.setValue("nonVegGuests", totalGuests - vegValue);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (!user || authError) {
        toast.error("You must be logged in to create an event")
        router.push('/auth/user-signin')
        return
      }
  
      // Format date for storage
      const formattedDate = format(values.eventDate, "yyyy-MM-dd");
  
      // Add the event to Supabase
      const { error: insertError } = await supabase
        .from('events')
        .insert([{
          user_id: user.id,
          name: values.eventName,
          type: values.eventType,
          venue_type: values.venue,
          event_date: formattedDate,
          event_time: values.eventTime,
          budget: values.budget,
          guest_count: values.guests,
          veg_guest_count: values.vegGuests,
          non_veg_guest_count: values.nonVegGuests,
          additional_requirements: values.additionalRequirements,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      if (insertError) throw insertError
  
      toast.success(`Event "${values.eventName}" created successfully!`)
      form.reset()
      router.push('/user-dashboard')
    } catch (error: any) {
      console.error('Error creating event:', error)
      toast.error(error.message || "Failed to create event. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const eventTypes = [
    "Wedding",
    "Corporate Event",
    "Birthday Party",
    "Anniversary",
    "Conference",
    "Product Launch",
    "Graduation Party",
    "Other",
  ]

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center font-aeonik">Event Registration</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Name Field */}
            <FormField
              control={form.control}
              name="eventName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-aeonik">Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event Type Dropdown */}
            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-aeonik">Event Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Event Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Picker */}
            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="font-aeonik">Event Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="w-full pl-3 text-left font-normal flex justify-between items-center"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select date</span>
                          )}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Time Input */}
            <FormField
              control={form.control}
              name="eventTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-aeonik">Event Time</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type="time"
                        placeholder="Select time"
                        {...field}
                      />
                    </FormControl>
                    <Clock className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Venue Selection (Radio Buttons) */}
          <FormField
            control={form.control}
            name="venue"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="font-aeonik">Venue Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-6"
                  >
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="indoor" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer font-aeonik">
                        Indoor
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="outdoor" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer font-aeonik">
                        Outdoor
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Budget Input Field */}
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-aeonik">Budget</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="Enter your budget" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Number of Guests Input Field */}
            <FormField
              control={form.control}
              name="guests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-aeonik">Total Number of Guests</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      placeholder="Enter number of guests" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        // Reset food preferences when total guests change
                        form.setValue("vegGuests", 0);
                        form.setValue("nonVegGuests", parseInt(e.target.value) || 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Food Preferences Section */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-4 font-aeonik">Food Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vegetarian Guests */}
              <FormField
                control={form.control}
                name="vegGuests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-aeonik">Vegetarian Guests</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max={totalGuests || 0}
                        placeholder="Number of vegetarian guests" 
                        {...field} 
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          field.onChange(value);
                          updateNonVegGuests(value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Guests requiring vegetarian meals
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Non-Vegetarian Guests */}
              <FormField
                control={form.control}
                name="nonVegGuests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-aeonik">Non-Vegetarian Guests</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        max={totalGuests || 0}
                        placeholder="Number of non-vegetarian guests" 
                        {...field} 
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          field.onChange(value);
                          if (totalGuests) {
                            form.setValue("vegGuests", totalGuests - value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Guests requiring non-vegetarian meals
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Additional Requirements (Textarea) */}
          <FormField
            control={form.control}
            name="additionalRequirements"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-aeonik">Additional Requirements (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter any special requests or preferences..." 
                    className="resize-none min-h-24"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-purple-500 text-white py-2 font-aeonik"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Event Details"}
          </Button>
        </form>
      </Form>
    </div>
  );
}