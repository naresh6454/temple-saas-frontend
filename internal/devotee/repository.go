package devotee

import (
	"github.com/sharath018/temple-management-backend/internal/userprofile"
	"gorm.io/gorm"
)

type Repository struct {
	DB *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{DB: db}
}

// GetJoinedEntities returns all temples the user has joined
func (r *Repository) GetJoinedEntities(userID uint) ([]userprofile.UserEntityMembership, error) {
	var memberships []userprofile.UserEntityMembership
	err := r.DB.Where("user_id = ?", userID).Find(&memberships).Error
	return memberships, err
}

// SelectTemple inserts or updates the selected temple membership
func (r *Repository) SelectTemple(userID, entityID uint) error {
	var existing userprofile.UserEntityMembership

	err := r.DB.Where("user_id = ? AND entity_id = ?", userID, entityID).
		First(&existing).Error

	if err != nil {
		// No existing membership, create new
		if err == gorm.ErrRecordNotFound {
			newMembership := userprofile.UserEntityMembership{
				UserID:   userID,
				EntityID: entityID,
				IsActive: true,
			}
			return r.DB.Create(&newMembership).Error
		}
		// Other DB error
		return err
	}

	// If already exists, just update IsActive = true
	existing.IsActive = true
	return r.DB.Save(&existing).Error
}

// GetMyTemple fetches the active temple membership with entity details
func (r *Repository) GetMyTemple(userID uint) (*userprofile.UserEntityMembership, error) {
	var membership userprofile.UserEntityMembership
	err := r.DB.Preload("Entity").
		Where("user_id = ? AND is_active = ?", userID, true).
		First(&membership).Error

	if err != nil {
		return nil, err
	}
	return &membership, nil
}

// ✅ GetDevoteeOverview returns summary data for devotee dashboard
func (r *Repository) GetDevoteeOverview(userID uint) (map[string]interface{}, error) {
	var eventCount int64
	var donationTotal float64

	// Count events attended by the user (table: event_attendance)
	err := r.DB.Table("event_attendance").
		Where("user_id = ?", userID).
		Count(&eventCount).Error
	if err != nil {
		return nil, err
	}

	// Sum of donations by the user (table: donations)
	err = r.DB.Table("donations").
		Where("user_id = ?", userID).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&donationTotal).Error
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"eventCount":     eventCount,
		"totalDonations": donationTotal,
	}, nil
}