/**
 * Hand-authored types derived from the GameFolio SQL schema (SCHEMA.md).
 *
 * To regenerate automatically from a live project run:
 *   npx supabase gen types typescript --project-id <your-project-id> > lib/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ─── Enum helpers ────────────────────────────────────────────────────────────

export type UserRoleType = 'PLAYER' | 'ORG_MEMBER' | 'ORG_ADMIN' | 'PLATFORM_ADMIN'
export type OrganizationMemberRole = 'OWNER' | 'MANAGER' | 'MEMBER'
export type ApplicationStatus = 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED'

// ─── Database schema ─────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: UserRoleType
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: UserRoleType
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: UserRoleType
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_roles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      player_profiles: {
        Row: {
          id: string
          user_id: string
          gamertag: string
          bio: string | null
          region: string | null
          competitive_experience: string | null
          hardware_details: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gamertag: string
          bio?: string | null
          region?: string | null
          competitive_experience?: string | null
          hardware_details?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          gamertag?: string
          bio?: string | null
          region?: string | null
          competitive_experience?: string | null
          hardware_details?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'player_profiles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      game_genres: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          id: string
          name: string
          genre_id: string | null
          developer: string | null
          release_year: number | null
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          genre_id?: string | null
          developer?: string | null
          release_year?: number | null
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          genre_id?: string | null
          developer?: string | null
          release_year?: number | null
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'games_genre_id_fkey'
            columns: ['genre_id']
            isOneToOne: false
            referencedRelation: 'game_genres'
            referencedColumns: ['id']
          }
        ]
      }
      game_roles: {
        Row: {
          id: string
          game_id: string
          role_name: string
        }
        Insert: {
          id?: string
          game_id: string
          role_name: string
        }
        Update: {
          id?: string
          game_id?: string
          role_name?: string
        }
        Relationships: [
          {
            foreignKeyName: 'game_roles_game_id_fkey'
            columns: ['game_id']
            isOneToOne: false
            referencedRelation: 'games'
            referencedColumns: ['id']
          }
        ]
      }
      player_game_stats: {
        Row: {
          id: string
          player_profile_id: string
          game_id: string
          main_role_id: string | null
          sub_role_id: string | null
          rank: string | null
          mmr: number | null
          win_rate: number | null
          hours_played: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_profile_id: string
          game_id: string
          main_role_id?: string | null
          sub_role_id?: string | null
          rank?: string | null
          mmr?: number | null
          win_rate?: number | null
          hours_played?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_profile_id?: string
          game_id?: string
          main_role_id?: string | null
          sub_role_id?: string | null
          rank?: string | null
          mmr?: number | null
          win_rate?: number | null
          hours_played?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'player_game_stats_player_profile_id_fkey'
            columns: ['player_profile_id']
            isOneToOne: false
            referencedRelation: 'player_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'player_game_stats_game_id_fkey'
            columns: ['game_id']
            isOneToOne: false
            referencedRelation: 'games'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'player_game_stats_main_role_id_fkey'
            columns: ['main_role_id']
            isOneToOne: false
            referencedRelation: 'game_roles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'player_game_stats_sub_role_id_fkey'
            columns: ['sub_role_id']
            isOneToOne: false
            referencedRelation: 'game_roles'
            referencedColumns: ['id']
          }
        ]
      }
      player_highlights: {
        Row: {
          id: string
          player_profile_id: string
          title: string
          video_url: string
          duration_seconds: number
          created_at: string
        }
        Insert: {
          id?: string
          player_profile_id: string
          title: string
          video_url: string
          duration_seconds: number
          created_at?: string
        }
        Update: {
          id?: string
          player_profile_id?: string
          title?: string
          video_url?: string
          duration_seconds?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'player_highlights_player_profile_id_fkey'
            columns: ['player_profile_id']
            isOneToOne: false
            referencedRelation: 'player_profiles'
            referencedColumns: ['id']
          }
        ]
      }
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          region: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          region?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          region?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: OrganizationMemberRole
          joined_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role: OrganizationMemberRole
          joined_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: OrganizationMemberRole
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'organization_members_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      rosters: {
        Row: {
          id: string
          organization_id: string
          game_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          game_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          game_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'rosters_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'rosters_game_id_fkey'
            columns: ['game_id']
            isOneToOne: false
            referencedRelation: 'games'
            referencedColumns: ['id']
          }
        ]
      }
      roster_members: {
        Row: {
          id: string
          roster_id: string
          user_id: string
          role_in_roster: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          roster_id: string
          user_id: string
          role_in_roster?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          roster_id?: string
          user_id?: string
          role_in_roster?: string | null
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'roster_members_roster_id_fkey'
            columns: ['roster_id']
            isOneToOne: false
            referencedRelation: 'rosters'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'roster_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      tryouts: {
        Row: {
          id: string
          organization_id: string
          game_id: string
          roster_id: string | null
          title: string
          role_needed_id: string | null
          requirements: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          game_id: string
          roster_id?: string | null
          title: string
          role_needed_id?: string | null
          requirements?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          game_id?: string
          roster_id?: string | null
          title?: string
          role_needed_id?: string | null
          requirements?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tryouts_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tryouts_game_id_fkey'
            columns: ['game_id']
            isOneToOne: false
            referencedRelation: 'games'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tryouts_roster_id_fkey'
            columns: ['roster_id']
            isOneToOne: false
            referencedRelation: 'rosters'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tryouts_role_needed_id_fkey'
            columns: ['role_needed_id']
            isOneToOne: false
            referencedRelation: 'game_roles'
            referencedColumns: ['id']
          }
        ]
      }
      applications: {
        Row: {
          id: string
          tryout_id: string
          player_profile_id: string
          status: ApplicationStatus
          message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tryout_id: string
          player_profile_id: string
          status?: ApplicationStatus
          message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tryout_id?: string
          player_profile_id?: string
          status?: ApplicationStatus
          message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'applications_tryout_id_fkey'
            columns: ['tryout_id']
            isOneToOne: false
            referencedRelation: 'tryouts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'applications_player_profile_id_fkey'
            columns: ['player_profile_id']
            isOneToOne: false
            referencedRelation: 'player_profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role_type: UserRoleType
      organization_member_role: OrganizationMemberRole
      application_status: ApplicationStatus
    }
  }
}

// ─── Convenience aliases ─────────────────────────────────────────────────────

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']