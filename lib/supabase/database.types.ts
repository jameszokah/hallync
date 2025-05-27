export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          university: string | null
          role: "student" | "owner" | "admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          university?: string | null
          role?: "student" | "owner" | "admin"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          university?: string | null
          role?: "student" | "owner" | "admin"
          created_at?: string
          updated_at?: string
        }
      }
      hostels: {
        Row: {
          id: string
          name: string
          description: string
          location: string
          university: string
          owner_id: string
          verified: boolean
          distance_to_campus: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          location: string
          university: string
          owner_id: string
          verified?: boolean
          distance_to_campus?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          location?: string
          university?: string
          owner_id?: string
          verified?: boolean
          distance_to_campus?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          hostel_id: string
          type: string
          price: number
          capacity: number
          available: number
          amenities: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hostel_id: string
          type: string
          price: number
          capacity: number
          available: number
          amenities?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hostel_id?: string
          type?: string
          price?: number
          capacity?: number
          available?: number
          amenities?: Json
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          room_id: string
          hostel_id: string
          check_in_date: string
          check_out_date: string
          status: "pending" | "confirmed" | "cancelled" | "completed"
          payment_status: "pending" | "partial" | "completed"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          room_id: string
          hostel_id: string
          check_in_date: string
          check_out_date: string
          status?: "pending" | "confirmed" | "cancelled" | "completed"
          payment_status?: "pending" | "partial" | "completed"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          room_id?: string
          hostel_id?: string
          check_in_date?: string
          check_out_date?: string
          status?: "pending" | "confirmed" | "cancelled" | "completed"
          payment_status?: "pending" | "partial" | "completed"
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          hostel_id: string
          rating: number
          comment: string
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          hostel_id: string
          rating: number
          comment: string
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          hostel_id?: string
          rating?: number
          comment?: string
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          user_id: string
          amount: number
          payment_method: "mobile_money" | "bank_transfer" | "card"
          provider: string | null
          transaction_id: string | null
          status: "pending" | "completed" | "failed"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          user_id: string
          amount: number
          payment_method: "mobile_money" | "bank_transfer" | "card"
          provider?: string | null
          transaction_id?: string | null
          status?: "pending" | "completed" | "failed"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          user_id?: string
          amount?: number
          payment_method?: "mobile_money" | "bank_transfer" | "card"
          provider?: string | null
          transaction_id?: string | null
          status?: "pending" | "completed" | "failed"
          created_at?: string
          updated_at?: string
        }
      }
      hostel_images: {
        Row: {
          id: string
          hostel_id: string
          url: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          hostel_id: string
          url: string
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          hostel_id?: string
          url?: string
          is_primary?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Insertables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type Updateables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]

export type User = Tables<"users">
export type Hostel = Tables<"hostels">
export type Room = Tables<"rooms">
export type Booking = Tables<"bookings">
export type Review = Tables<"reviews">
export type Payment = Tables<"payments">
export type HostelImage = Tables<"hostel_images">
