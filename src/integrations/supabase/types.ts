export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_creatives: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_archived: boolean
          master_message: string
          service_name: string
          tagline: string
          tags: string[]
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_archived?: boolean
          master_message?: string
          service_name?: string
          tagline?: string
          tags?: string[]
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_archived?: boolean
          master_message?: string
          service_name?: string
          tagline?: string
          tags?: string[]
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          accent_color: string
          ai_alert_crit_daily: number
          ai_alert_warn_daily: number
          ai_credit_budget_monthly: number
          company_logo: string | null
          company_name: string
          contact_email: string
          contact_phone: string
          contact_website: string
          contact_whatsapp: string
          created_at: string
          dark_logo: string | null
          email: string
          founder: string
          id: string
          light_logo: string | null
          phone: string
          primary_color: string
          secondary_color: string
          singleton: boolean
          updated_at: string
          website: string
          whatsapp: string
        }
        Insert: {
          accent_color?: string
          ai_alert_crit_daily?: number
          ai_alert_warn_daily?: number
          ai_credit_budget_monthly?: number
          company_logo?: string | null
          company_name?: string
          contact_email?: string
          contact_phone?: string
          contact_website?: string
          contact_whatsapp?: string
          created_at?: string
          dark_logo?: string | null
          email?: string
          founder?: string
          id?: string
          light_logo?: string | null
          phone?: string
          primary_color?: string
          secondary_color?: string
          singleton?: boolean
          updated_at?: string
          website?: string
          whatsapp?: string
        }
        Update: {
          accent_color?: string
          ai_alert_crit_daily?: number
          ai_alert_warn_daily?: number
          ai_credit_budget_monthly?: number
          company_logo?: string | null
          company_name?: string
          contact_email?: string
          contact_phone?: string
          contact_website?: string
          contact_whatsapp?: string
          created_at?: string
          dark_logo?: string | null
          email?: string
          founder?: string
          id?: string
          light_logo?: string | null
          phone?: string
          primary_color?: string
          secondary_color?: string
          singleton?: boolean
          updated_at?: string
          website?: string
          whatsapp?: string
        }
        Relationships: []
      }
      ai_image_generations: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          image_storage_path: string | null
          image_url: string | null
          n8n_execution_id: string | null
          prompt: string
          provider: string
          request_id: string
          size: string
          status: string
          updated_at: string
          user_email: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          image_storage_path?: string | null
          image_url?: string | null
          n8n_execution_id?: string | null
          prompt: string
          provider?: string
          request_id?: string
          size?: string
          status?: string
          updated_at?: string
          user_email: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          image_storage_path?: string | null
          image_url?: string | null
          n8n_execution_id?: string | null
          prompt?: string
          provider?: string
          request_id?: string
          size?: string
          status?: string
          updated_at?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_quotas: {
        Row: {
          created_at: string
          daily_limit: number
          id: string
          tier: string
          tool: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_limit: number
          id?: string
          tier: string
          tool: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_limit?: number
          id?: string
          tier?: string
          tool?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          model: string
          partner_id: string
          provider: string
          success: boolean
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          model?: string
          partner_id: string
          provider: string
          success?: boolean
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          model?: string
          partner_id?: string
          provider?: string
          success?: boolean
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_label: string
          created_at: string
          id: string
          metadata: Json
          subject_id: string
          subject_type: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_label?: string
          created_at?: string
          id?: string
          metadata?: Json
          subject_id: string
          subject_type: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_label?: string
          created_at?: string
          id?: string
          metadata?: Json
          subject_id?: string
          subject_type?: string
        }
        Relationships: []
      }
      banking_payment_partners: {
        Row: {
          account_type: string | null
          common_rejection_reasons: string[]
          cons: string[]
          created_at: string
          currency: string | null
          documents_needed: string[]
          id: string
          logo_url: string | null
          name: string
          notes_md: string | null
          pros: string[]
          provider_slug: string
          service_id: string | null
          setup_fee: number | null
          sort_order: number
          status: string
          supported_company_types: string[]
          supported_countries: string[]
          typical_approval_days: string | null
          updated_at: string
        }
        Insert: {
          account_type?: string | null
          common_rejection_reasons?: string[]
          cons?: string[]
          created_at?: string
          currency?: string | null
          documents_needed?: string[]
          id?: string
          logo_url?: string | null
          name: string
          notes_md?: string | null
          pros?: string[]
          provider_slug: string
          service_id?: string | null
          setup_fee?: number | null
          sort_order?: number
          status?: string
          supported_company_types?: string[]
          supported_countries?: string[]
          typical_approval_days?: string | null
          updated_at?: string
        }
        Update: {
          account_type?: string | null
          common_rejection_reasons?: string[]
          cons?: string[]
          created_at?: string
          currency?: string | null
          documents_needed?: string[]
          id?: string
          logo_url?: string | null
          name?: string
          notes_md?: string | null
          pros?: string[]
          provider_slug?: string
          service_id?: string | null
          setup_fee?: number | null
          sort_order?: number
          status?: string
          supported_company_types?: string[]
          supported_countries?: string[]
          typical_approval_days?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "banking_payment_partners_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_assets: {
        Row: {
          created_at: string | null
          file_url: string | null
          id: string
          kind: string
          label: string
          meta: Json
          owner: string
          partner_id: string | null
          status: string | null
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          file_url?: string | null
          id?: string
          kind: string
          label: string
          meta?: Json
          owner: string
          partner_id?: string | null
          status?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          file_url?: string | null
          id?: string
          kind?: string
          label?: string
          meta?: Json
          owner?: string
          partner_id?: string | null
          status?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_assets_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          brand_type: string
          created_at: string
          facebook_handle: string | null
          id: string
          instagram_handle: string | null
          is_active: boolean
          logo_prompt: string | null
          logo_url: string | null
          meaning_en: string | null
          meaning_ur: string | null
          name: string
          partner_id: string
          tagline: string | null
          theme: string
          updated_at: string
        }
        Insert: {
          brand_type?: string
          created_at?: string
          facebook_handle?: string | null
          id?: string
          instagram_handle?: string | null
          is_active?: boolean
          logo_prompt?: string | null
          logo_url?: string | null
          meaning_en?: string | null
          meaning_ur?: string | null
          name: string
          partner_id: string
          tagline?: string | null
          theme?: string
          updated_at?: string
        }
        Update: {
          brand_type?: string
          created_at?: string
          facebook_handle?: string | null
          id?: string
          instagram_handle?: string | null
          is_active?: boolean
          logo_prompt?: string | null
          logo_url?: string | null
          meaning_en?: string | null
          meaning_ur?: string | null
          name?: string
          partner_id?: string
          tagline?: string | null
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          admin_note: string | null
          amount_gbp: number
          created_at: string
          id: string
          lead_id: string | null
          paid_at: string | null
          partner_id: string
          payout_method: Database["public"]["Enums"]["payout_method"] | null
          service_id: string | null
          status: Database["public"]["Enums"]["commission_status"]
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          amount_gbp?: number
          created_at?: string
          id?: string
          lead_id?: string | null
          paid_at?: string | null
          partner_id: string
          payout_method?: Database["public"]["Enums"]["payout_method"] | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          amount_gbp?: number
          created_at?: string
          id?: string
          lead_id?: string | null
          paid_at?: string | null
          partner_id?: string
          payout_method?: Database["public"]["Enums"]["payout_method"] | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "manual_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      content_library: {
        Row: {
          created_at: string
          hero_image_url: string | null
          id: string
          keywords: string[]
          published_at: string | null
          service_ids: string[]
          status: string
          summary: string | null
          title: string
          type: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          hero_image_url?: string | null
          id?: string
          keywords?: string[]
          published_at?: string | null
          service_ids?: string[]
          status?: string
          summary?: string | null
          title: string
          type: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          hero_image_url?: string | null
          id?: string
          keywords?: string[]
          published_at?: string | null
          service_ids?: string[]
          status?: string
          summary?: string | null
          title?: string
          type?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      downloads: {
        Row: {
          created_at: string
          creative_id: string | null
          downloaded_at: string
          file_type: string
          id: string
          partner_id: string
        }
        Insert: {
          created_at?: string
          creative_id?: string | null
          downloaded_at?: string
          file_type?: string
          id?: string
          partner_id: string
        }
        Update: {
          created_at?: string
          creative_id?: string | null
          downloaded_at?: string
          file_type?: string
          id?: string
          partner_id?: string
        }
        Relationships: []
      }
      facebook_ads_guides: {
        Row: {
          audience_targeting: Json
          budget_guidance: string | null
          compliance_notes: string | null
          created_at: string
          creative_format: string | null
          cta_button: string | null
          description_template: string | null
          headline_template: string | null
          id: string
          landing_url_pattern: string | null
          objective: string | null
          pixel_event: string | null
          primary_text_template: string | null
          service_id: string | null
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          audience_targeting?: Json
          budget_guidance?: string | null
          compliance_notes?: string | null
          created_at?: string
          creative_format?: string | null
          cta_button?: string | null
          description_template?: string | null
          headline_template?: string | null
          id?: string
          landing_url_pattern?: string | null
          objective?: string | null
          pixel_event?: string | null
          primary_text_template?: string | null
          service_id?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          audience_targeting?: Json
          budget_guidance?: string | null
          compliance_notes?: string | null
          created_at?: string
          creative_format?: string | null
          cta_button?: string | null
          description_template?: string | null
          headline_template?: string | null
          id?: string
          landing_url_pattern?: string | null
          objective?: string | null
          pixel_event?: string | null
          primary_text_template?: string | null
          service_id?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facebook_ads_guides_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_services: {
        Row: {
          faq_id: string
          service_id: string
        }
        Insert: {
          faq_id: string
          service_id: string
        }
        Update: {
          faq_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faq_services_faq_id_fkey"
            columns: ["faq_id"]
            isOneToOne: false
            referencedRelation: "faqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faq_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer_md: string | null
          category: string | null
          created_at: string
          id: string
          published: boolean
          question: string
          sort_order: number
          source_url: string | null
          updated_at: string
        }
        Insert: {
          answer_md?: string | null
          category?: string | null
          created_at?: string
          id?: string
          published?: boolean
          question: string
          sort_order?: number
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          answer_md?: string | null
          category?: string | null
          created_at?: string
          id?: string
          published?: boolean
          question?: string
          sort_order?: number
          source_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      generated_creatives: {
        Row: {
          caption: string | null
          created_at: string
          cta: string | null
          description: string | null
          external_prompt: string | null
          hashtags: string[]
          headline: string | null
          id: string
          mode: string
          output_image_url: string
          partner_id: string
          platform: string
          service_id: string | null
          size: string
          source_creative_id: string | null
          style_version: string
          title: string | null
          updated_at: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          cta?: string | null
          description?: string | null
          external_prompt?: string | null
          hashtags?: string[]
          headline?: string | null
          id?: string
          mode?: string
          output_image_url?: string
          partner_id: string
          platform?: string
          service_id?: string | null
          size?: string
          source_creative_id?: string | null
          style_version?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          cta?: string | null
          description?: string | null
          external_prompt?: string | null
          hashtags?: string[]
          headline?: string | null
          id?: string
          mode?: string
          output_image_url?: string
          partner_id?: string
          platform?: string
          service_id?: string | null
          size?: string
          source_creative_id?: string | null
          style_version?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_creatives_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_creatives_source_creative_id_fkey"
            columns: ["source_creative_id"]
            isOneToOne: false
            referencedRelation: "admin_creatives"
            referencedColumns: ["id"]
          },
        ]
      }
      jurisdictions: {
        Row: {
          code: string
          created_at: string
          currency: string
          id: string
          label: string
          notes: string | null
          processing_days: string | null
          service_id: string
          sort_order: number
          status: string
          surcharge: number | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          currency?: string
          id?: string
          label: string
          notes?: string | null
          processing_days?: string | null
          service_id: string
          sort_order?: number
          status?: string
          surcharge?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          currency?: string
          id?: string
          label?: string
          notes?: string | null
          processing_days?: string | null
          service_id?: string
          sort_order?: number
          status?: string
          surcharge?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jurisdictions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      keywords: {
        Row: {
          created_at: string
          id: string
          intent: string | null
          keyword: string
          locale: string
          match_type: string | null
          notes: string | null
          service_id: string | null
          sort_order: number
          status: string
          updated_at: string
          volume_band: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          intent?: string | null
          keyword: string
          locale?: string
          match_type?: string | null
          notes?: string | null
          service_id?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
          volume_band?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          intent?: string | null
          keyword?: string
          locale?: string
          match_type?: string | null
          notes?: string | null
          service_id?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
          volume_band?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "keywords_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_leads: {
        Row: {
          client_email: string
          client_name: string
          client_whatsapp: string
          created_at: string
          estimated_commission_gbp: number
          id: string
          notes: string
          partner_id: string
          quoted_price_gbp: number | null
          service_id: string | null
          service_name_snapshot: string
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          client_email?: string
          client_name: string
          client_whatsapp?: string
          created_at?: string
          estimated_commission_gbp?: number
          id?: string
          notes?: string
          partner_id: string
          quoted_price_gbp?: number | null
          service_id?: string | null
          service_name_snapshot?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          client_email?: string
          client_name?: string
          client_whatsapp?: string
          created_at?: string
          estimated_commission_gbp?: number
          id?: string
          notes?: string
          partner_id?: string
          quoted_price_gbp?: number | null
          service_id?: string | null
          service_name_snapshot?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_leads_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_angles: {
        Row: {
          angle: string
          audience: string | null
          channels: string[]
          created_at: string
          cta: string | null
          id: string
          pain_point: string | null
          promise: string | null
          proof: string | null
          service_id: string | null
          sort_order: number
          status: string
          tone: string | null
          updated_at: string
        }
        Insert: {
          angle: string
          audience?: string | null
          channels?: string[]
          created_at?: string
          cta?: string | null
          id?: string
          pain_point?: string | null
          promise?: string | null
          proof?: string | null
          service_id?: string | null
          sort_order?: number
          status?: string
          tone?: string | null
          updated_at?: string
        }
        Update: {
          angle?: string
          audience?: string | null
          channels?: string[]
          created_at?: string
          cta?: string | null
          id?: string
          pain_point?: string | null
          promise?: string | null
          proof?: string | null
          service_id?: string | null
          sort_order?: number
          status?: string
          tone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_angles_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string
          client_email: string
          client_name: string
          client_whatsapp: string
          completed_at: string | null
          created_at: string
          id: string
          lead_id: string | null
          partner_id: string
          partner_visible_notes: string
          service_id: string | null
          service_name_snapshot: string
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
        }
        Insert: {
          admin_notes?: string
          client_email?: string
          client_name?: string
          client_whatsapp?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          partner_id: string
          partner_visible_notes?: string
          service_id?: string | null
          service_name_snapshot?: string
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Update: {
          admin_notes?: string
          client_email?: string
          client_name?: string
          client_whatsapp?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          partner_id?: string
          partner_visible_notes?: string
          service_id?: string | null
          service_name_snapshot?: string
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "manual_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_data_requests: {
        Row: {
          category: string
          created_at: string | null
          id: string
          item: string
          notes: string | null
          priority: string | null
          provided_at: string | null
          requested_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          item: string
          notes?: string | null
          priority?: string | null
          provided_at?: string | null
          requested_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          item?: string
          notes?: string | null
          priority?: string | null
          provided_at?: string | null
          requested_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      package_features: {
        Row: {
          created_at: string
          id: string
          included: boolean
          label: string
          note: string | null
          package_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          included?: boolean
          label: string
          note?: string | null
          package_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          included?: boolean
          label?: string
          note?: string | null
          package_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_features_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_terms: {
        Row: {
          active_from: string | null
          active_to: string | null
          b2b_price: number | null
          commission_flat: number | null
          commission_pct: number | null
          created_at: string | null
          currency: string | null
          id: string
          min_payout: number | null
          notes_admin: string | null
          package_id: string | null
          partner_tier: string | null
          payout_cadence: string | null
          service_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          active_from?: string | null
          active_to?: string | null
          b2b_price?: number | null
          commission_flat?: number | null
          commission_pct?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          min_payout?: number | null
          notes_admin?: string | null
          package_id?: string | null
          partner_tier?: string | null
          payout_cadence?: string | null
          service_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          active_from?: string | null
          active_to?: string | null
          b2b_price?: number | null
          commission_flat?: number | null
          commission_pct?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          min_payout?: number | null
          notes_admin?: string | null
          package_id?: string | null
          partner_tier?: string | null
          payout_cadence?: string | null
          service_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_terms_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_terms_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          brand_name: string
          created_at: string
          email: string
          full_name: string
          id: string
          logo_url: string | null
          primary_color: string
          secondary_color: string
          social_links: Json
          status: string
          tier: string
          updated_at: string
          website: string | null
          whatsapp: string
        }
        Insert: {
          brand_name?: string
          created_at?: string
          email: string
          full_name?: string
          id: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          social_links?: Json
          status?: string
          tier?: string
          updated_at?: string
          website?: string | null
          whatsapp?: string
        }
        Update: {
          brand_name?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          social_links?: Json
          status?: string
          tier?: string
          updated_at?: string
          website?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      publishing_guides: {
        Row: {
          best_format: string | null
          created_at: string
          do_dont_md: string | null
          examples: string[]
          hashtag_strategy: string | null
          id: string
          optimal_specs: Json
          platform: string
          post_template_md: string | null
          service_id: string | null
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          best_format?: string | null
          created_at?: string
          do_dont_md?: string | null
          examples?: string[]
          hashtag_strategy?: string | null
          id?: string
          optimal_specs?: Json
          platform: string
          post_template_md?: string | null
          service_id?: string | null
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          best_format?: string | null
          created_at?: string
          do_dont_md?: string | null
          examples?: string[]
          hashtag_strategy?: string | null
          id?: string
          optimal_specs?: Json
          platform?: string
          post_template_md?: string | null
          service_id?: string | null
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "publishing_guides_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      required_documents: {
        Row: {
          applies_to: string | null
          created_at: string
          document_label: string
          guidance: string | null
          id: string
          required: boolean
          service_id: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          applies_to?: string | null
          created_at?: string
          document_label: string
          guidance?: string | null
          id?: string
          required?: boolean
          service_id: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          applies_to?: string | null
          created_at?: string
          document_label?: string
          guidance?: string | null
          id?: string
          required?: boolean
          service_id?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "required_documents_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          label: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          label: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          label?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      service_packages: {
        Row: {
          created_at: string
          currency: string
          id: string
          is_popular: boolean
          meta: Json
          price: number | null
          processing_days: string | null
          service_id: string
          sort_order: number
          tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          is_popular?: boolean
          meta?: Json
          price?: number | null
          processing_days?: string | null
          service_id: string
          sort_order?: number
          tier: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          is_popular?: boolean
          meta?: Json
          price?: number | null
          processing_days?: string | null
          service_id?: string
          sort_order?: number
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_packages_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string
          category_id: string | null
          commission_amount_gbp: number
          created_at: string
          currency: string
          description: string
          hero_image_url: string | null
          id: string
          is_active: boolean
          long_desc: string | null
          meta: Json
          name: string
          price_from: number | null
          price_unit: string | null
          public_url: string | null
          requires_jurisdiction: boolean
          short_desc: string | null
          slug: string | null
          sort_order: number
          status: string
          turnaround_days_max: number | null
          turnaround_days_min: number | null
          updated_at: string
        }
        Insert: {
          category: string
          category_id?: string | null
          commission_amount_gbp?: number
          created_at?: string
          currency?: string
          description?: string
          hero_image_url?: string | null
          id?: string
          is_active?: boolean
          long_desc?: string | null
          meta?: Json
          name: string
          price_from?: number | null
          price_unit?: string | null
          public_url?: string | null
          requires_jurisdiction?: boolean
          short_desc?: string | null
          slug?: string | null
          sort_order?: number
          status?: string
          turnaround_days_max?: number | null
          turnaround_days_min?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          category_id?: string | null
          commission_amount_gbp?: number
          created_at?: string
          currency?: string
          description?: string
          hero_image_url?: string | null
          id?: string
          is_active?: boolean
          long_desc?: string | null
          meta?: Json
          name?: string
          price_from?: number | null
          price_unit?: string | null
          public_url?: string | null
          requires_jurisdiction?: boolean
          short_desc?: string | null
          slug?: string | null
          sort_order?: number
          status?: string
          turnaround_days_max?: number | null
          turnaround_days_min?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_settings_public: {
        Row: {
          accent_color: string | null
          company_logo: string | null
          company_name: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_website: string | null
          contact_whatsapp: string | null
          dark_logo: string | null
          email: string | null
          founder: string | null
          id: string | null
          light_logo: string | null
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          accent_color?: string | null
          company_logo?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_website?: string | null
          contact_whatsapp?: string | null
          dark_logo?: string | null
          email?: string | null
          founder?: string | null
          id?: string | null
          light_logo?: string | null
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          accent_color?: string | null
          company_logo?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_website?: string | null
          contact_whatsapp?: string | null
          dark_logo?: string | null
          email?: string | null
          founder?: string | null
          id?: string | null
          light_logo?: string | null
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_ai_quota: {
        Args: { _tool: string; _user_id: string }
        Returns: {
          allowed: boolean
          daily_limit: number
          tier: string
          used: number
        }[]
      }
      check_image_quota: {
        Args: { _user_id: string }
        Returns: {
          allowed: boolean
          daily_limit: number
          tier: string
          used: number
        }[]
      }
      get_admin_settings_public: {
        Args: never
        Returns: {
          accent_color: string | null
          company_logo: string | null
          company_name: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_website: string | null
          contact_whatsapp: string | null
          dark_logo: string | null
          email: string | null
          founder: string | null
          id: string | null
          light_logo: string | null
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          website: string | null
          whatsapp: string | null
        }
        SetofOptions: {
          from: "*"
          to: "admin_settings_public"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_my_terms: {
        Args: never
        Returns: {
          commission_flat: number
          commission_pct: number
          currency: string
          min_payout: number
          package_id: string
          partner_tier: string
          payout_cadence: string
          service_id: string
          status: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_ai_tier: { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "partner"
      commission_status:
        | "pending"
        | "approved"
        | "delayed"
        | "paid"
        | "rejected"
      lead_status: "new" | "contacted" | "converted" | "rejected"
      order_status:
        | "new"
        | "contacted"
        | "in_progress"
        | "waiting_documents"
        | "completed"
        | "cancelled"
      payout_method: "manual_bank_transfer" | "paypal" | "wise"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "partner"],
      commission_status: ["pending", "approved", "delayed", "paid", "rejected"],
      lead_status: ["new", "contacted", "converted", "rejected"],
      order_status: [
        "new",
        "contacted",
        "in_progress",
        "waiting_documents",
        "completed",
        "cancelled",
      ],
      payout_method: ["manual_bank_transfer", "paypal", "wise"],
    },
  },
} as const
