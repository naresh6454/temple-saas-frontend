package auth

import (
	"time"

	"gorm.io/gorm"
)

// UserRole represents the user_roles table
type UserRole struct {
	ID                  uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	RoleName            string         `gorm:"size:50;unique;not null" json:"role_name"` // tenant, devotee, volunteer, super_admin
	Description         string         `gorm:"type:text" json:"description"`
	CanRegisterPublicly bool           `gorm:"default:true" json:"can_register_publicly"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
}

// TableName overrides table name for UserRole
func (UserRole) TableName() string {
	return "user_roles"
}

// User represents the users table
// User represents the users table
type User struct {
	ID                   uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	FullName             string         `gorm:"size:255;not null" json:"full_name"`
	Email                string         `gorm:"size:255;unique;not null" json:"email"`
	PasswordHash         string         `gorm:"size:255;not null" json:"-"`
	Phone                string         `gorm:"size:20;not null" json:"phone"` // ✅ updated
	RoleID               uint           `gorm:"not null" json:"role_id"`
	Role                 UserRole       `gorm:"foreignKey:RoleID;references:ID" json:"role"`
	EntityID             *uint          `gorm:"index" json:"entity_id,omitempty"`
	Status               string         `gorm:"size:20;default:'active'" json:"status"` // active, pending, rejected, inactive
	EmailVerified        bool           `gorm:"default:false" json:"email_verified"`
	EmailVerifiedAt      *time.Time     `json:"email_verified_at,omitempty"`
	ForgotPasswordToken  *string        `gorm:"size:255" json:"-"`
	ForgotPasswordExpiry *time.Time     `json:"-"`
	CreatedAt            time.Time      `json:"created_at"`
	UpdatedAt            time.Time      `json:"updated_at"`
	DeletedAt            gorm.DeletedAt `gorm:"index" json:"-"`
}


// TableName overrides table name for User
func (User) TableName() string {
	return "users"
}

// ApprovalRequest represents approval_requests table
type ApprovalRequest struct {
	ID          uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID      uint       `gorm:"not null" json:"user_id"`
	User        User       `gorm:"foreignKey:UserID;references:ID" json:"user"`
	RequestType string     `gorm:"size:50;not null" json:"request_type"` // tenant_approval, temple_approval
	EntityID    *uint      `json:"entity_id,omitempty"`
	Status      string     `gorm:"size:20;default:'pending'" json:"status"` // pending, approved, rejected
	AdminNotes  *string    `gorm:"type:text" json:"admin_notes,omitempty"`
	ApprovedBy  *uint      `json:"approved_by,omitempty"`
	ApprovedAt  *time.Time `json:"approved_at,omitempty"`
	RejectedAt  *time.Time `json:"rejected_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// TableName overrides table name for ApprovalRequest
func (ApprovalRequest) TableName() string {
	return "approval_requests"
}
