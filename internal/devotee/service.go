package devotee

import (
	"errors"

	"github.com/sharath018/temple-management-backend/internal/userprofile"
)

type Service struct {
	Repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{Repo: repo}
}

// Save devotee's selected temple
func (s *Service) SelectTemple(userID uint, entityID uint) error {
	// Check if already joined
	joinedEntities, err := s.Repo.GetJoinedEntities(userID)
	if err != nil {
		return err
	}

	for _, m := range joinedEntities {
		if m.EntityID == entityID {
			if m.IsActive {
				return errors.New("you have already selected this temple")
			}
			// Reactivate existing membership
			return s.Repo.SelectTemple(userID, entityID)
		}
	}

	// Create new membership
	return s.Repo.SelectTemple(userID, entityID)
}

// Get devotee's selected temple
func (s *Service) GetMyTemple(userID uint) (*userprofile.UserEntityMembership, error) {
	return s.Repo.GetMyTemple(userID)
}

// ✅ Get overview data for devotee dashboard
func (s *Service) GetDevoteeOverview(userID uint) (map[string]interface{}, error) {
	return s.Repo.GetDevoteeOverview(userID)
}