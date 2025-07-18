package donation

import (
	"time"

	"gorm.io/gorm"
)

// DonationStatus represents valid payment states
const (
	StatusPending = "PENDING"
	StatusSuccess = "SUCCESS"
	StatusFailed  = "FAILED"
)

// DonationMethod types (optional use, useful for validations/stats)
const (
	MethodUPI        = "UPI"
	MethodCard       = "CARD"
	MethodNetbanking = "NETBANKING"
	MethodWallet     = "WALLET"
)

// DonationType values — for clarity in filtering/analytics
const (
	TypeGeneral  = "general"
	TypeSeva     = "seva"
	TypeEvent    = "event"
	TypeFestival = "festival"
)

// Donation represents a donation transaction via Razorpay
type Donation struct {
	ID uint `gorm:"primaryKey" json:"id"`

	UserID   uint `gorm:"not null;index" json:"user_id"`     // Devotee who donated
	EntityID uint `gorm:"not null;index" json:"entity_id"`   // Temple ID

	Amount       float64 `gorm:"type:decimal(10,2);not null" json:"amount"`     // Amount in INR (₹)
	DonationType string  `gorm:"size:50;index" json:"donation_type"`            // general, seva, event, etc.
	ReferenceID  *uint   `gorm:"index" json:"reference_id,omitempty"`           // Links to seva/event ID if needed

	Method string `gorm:"size:50;not null;index" json:"method"`                 // Razorpay method used (UPI, CARD, etc.)
	Status string `gorm:"size:20;default:'PENDING';index" json:"status"`        // PENDING, SUCCESS, FAILED

	OrderID   string  `gorm:"size:100;uniqueIndex" json:"order_id"`            // Razorpay Order ID
	PaymentID *string `gorm:"size:100;index" json:"payment_id,omitempty"`      // Razorpay Payment ID (only if success)

	Note *string `gorm:"type:text" json:"note,omitempty"`                       // Optional donor message/intention

	DonatedAt *time.Time     `json:"donated_at,omitempty"`                      // Set only on successful payment
	CreatedAt time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}






// package donation

// import (
// 	"time"

// 	"gorm.io/gorm"
// )

// // Donation model represents a donation transaction
// type Donation struct {
// 	ID            uint           `gorm:"primaryKey" json:"id"`
// 	UserID        uint           `gorm:"not null;index" json:"user_id"`        // Devotee who donated
// 	EntityID      uint           `gorm:"not null;index" json:"entity_id"`      // Temple ID
// 	Amount        float64        `gorm:"type:decimal(10,2);not null" json:"amount"`
// 	DonationType  string         `gorm:"size:50" json:"donation_type"`         // general, seva, event, festival
// 	ReferenceID   *uint          `gorm:"index" json:"reference_id"`            // Optional Seva/Event ID
// 	Method        string         `gorm:"size:50;not null" json:"method"`       // UPI, CARD, NETBANKING, etc.
// 	Status        string         `gorm:"size:20;default:'PENDING'" json:"status"` // PENDING, SUCCESS, FAILED
// 	OrderID       string         `gorm:"size:100;index" json:"order_id"`       // Razorpay Order ID
// 	PaymentID     *string        `gorm:"size:100;index" json:"payment_id"`     // Razorpay Payment ID (nullable until success)
// 	ReceiptURL    *string        `gorm:"type:text" json:"receipt_url"`         // Optional link to PDF/email receipt
// 	Note          *string        `gorm:"type:text" json:"note"`                // Optional donor message / intention
//     DonatedAt time.Time `json:"donated_at"` // Set this manually when payment is verified
// 	CreatedAt     time.Time      `gorm:"autoCreateTime" json:"created_at"`
// 	UpdatedAt     time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
// 	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
// }