package userprofile

import (
	"time"

	"github.com/sharath018/temple-management-backend/internal/entity"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// ─── Devotee Profile ─────────────────────────────────────────────────────────
type DevoteeProfile struct {
	ID                          uint           `gorm:"primaryKey"`
	UserID                      uint           `gorm:"uniqueIndex;not null" json:"user_id"`
	DateOfBirth                 *time.Time     `json:"date_of_birth,omitempty"`
	Gender                      *string        `json:"gender,omitempty"`
	Address                     *string        `json:"address,omitempty"`
	Gotra                       *string        `json:"gotra,omitempty"`
	Nakshatra                   *string        `json:"nakshatra,omitempty"`
	Rashi                       *string        `json:"rashi,omitempty"`
	Lagna                       *string        `json:"lagna,omitempty"`
	VedaShaka                   *string        `json:"veda_shaka,omitempty"`
	FatherName                  *string        `json:"father_name,omitempty"`
	MotherName                  *string        `json:"mother_name,omitempty"`
	GrandfatherName             *string        `json:"grandfather_name,omitempty"`
	GrandmotherName             *string        `json:"grandmother_name,omitempty"`
	FamilyTreeURL               *string        `json:"family_tree_url,omitempty"`
	FavoriteSevas               datatypes.JSON `json:"favorite_sevas,omitempty"`
	DonationInterests           datatypes.JSON `json:"donation_interests,omitempty"`
	SpouseInfo                  datatypes.JSON `json:"spouse_info,omitempty"`
	ChildrenInfo                datatypes.JSON `json:"children_info,omitempty"`
	EmergencyContacts           datatypes.JSON `json:"emergency_contacts,omitempty"`
	HealthInfo                  *string        `json:"health_info,omitempty"`
	SankalpaNotes               *string        `json:"sankalpa_notes,omitempty"`
	PhotosURL                   datatypes.JSON `json:"photos_url,omitempty"`
	ProfileCompletionPercentage int            `json:"profile_completion_percentage"`
	CreatedAt                   time.Time      `json:"created_at"`
	UpdatedAt                   time.Time      `json:"updated_at"`
	DeletedAt                   gorm.DeletedAt `gorm:"index" json:"-"`
}

// ─── Temple Membership Mapping ───────────────────────────────────────────────
type UserEntityMembership struct {
	ID        uint           `gorm:"primaryKey"`
	UserID    uint           `gorm:"not null" json:"user_id"`
	EntityID  uint           `gorm:"not null" json:"entity_id"`
	Entity    entity.Entity  `gorm:"foreignKey:EntityID" json:"entity"`
	JoinedAt  time.Time      `gorm:"default:current_timestamp" json:"joined_at"`
	Status    string         `gorm:"default:'active'" json:"status"` // active / inactive
	IsActive  bool           `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}