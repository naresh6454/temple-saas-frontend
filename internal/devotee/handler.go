package devotee

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sharath018/temple-management-backend/internal/auth"
)

type Handler struct {
	Service *Service
}

func NewHandler(s *Service) *Handler {
	return &Handler{Service: s}
}

// POST /devotee/select-temple
func (h *Handler) SelectTemple(c *gin.Context) {
	var req struct {
		EntityID uint `json:"entity_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.EntityID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entity_id"})
		return
	}

	user, _ := c.Get("user")
	userID := user.(auth.User).ID

	if err := h.Service.SelectTemple(userID, req.EntityID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Temple selected successfully"})
}

// GET /devotee/my-temple
func (h *Handler) GetMyTemple(c *gin.Context) {
	user, _ := c.Get("user")
	userID := user.(auth.User).ID

	membership, err := h.Service.GetMyTemple(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No temple selected"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"temple_id":      membership.EntityID,
		"temple_name":    membership.Entity.Name,
		"street_address": membership.Entity.StreetAddress,
		"city":           membership.Entity.City,
		"email":          membership.Entity.Email,
	})
}

// GET /devotee/overview
func (h *Handler) GetDevoteeOverview(c *gin.Context) {
	user, _ := c.Get("user")
	userID := user.(auth.User).ID

	overview, err := h.Service.GetDevoteeOverview(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load overview"})
		return
	}

	c.JSON(http.StatusOK, overview)
}