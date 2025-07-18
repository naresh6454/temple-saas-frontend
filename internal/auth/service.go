package auth

import (
	"errors"
	"strings"
	"time"
	"fmt"
	"crypto/rand"
	"encoding/hex"
	"regexp"

	"github.com/golang-jwt/jwt/v5"
	"github.com/sharath018/temple-management-backend/utils"
	"github.com/sharath018/temple-management-backend/config"
	"golang.org/x/crypto/bcrypt"
)

type TokenPair struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

type Service interface {
	Register(input RegisterInput) error
	Login(input LoginInput) (*TokenPair, *User, error)
	Refresh(refreshToken string) (string, error)
	GetUserByID(userID uint) (User, error)

	// ✅ NEW
	RequestPasswordReset(email string) error
	ResetPassword(token string, newPassword string) error
	Logout() error // (for stateless JWT, we simply return nil)
}

type service struct {
	repo           Repository
	accessSecret   string
	refreshSecret  string
	accessTTL      time.Duration
	refreshTTL     time.Duration
}

func NewService(r Repository, cfg *config.Config) Service {
	return &service{
		repo:          r,
		accessSecret:  cfg.JWTAccessSecret,
		refreshSecret: cfg.JWTRefreshSecret,
		accessTTL:     time.Duration(cfg.JWTAccessTTLHours) * time.Hour,
		refreshTTL:    time.Duration(cfg.JWTRefreshTTLHours) * time.Hour,
	}
}

// =============================
// Register
// =============================

type RegisterInput struct {
	FullName string
	Email    string
	Password string
	Role     string
	Phone    string
}

func (s *service) Register(in RegisterInput) error {
	roleName := strings.ToLower(in.Role)
	role, err := s.repo.FindRoleByName(roleName)
	if err != nil {
		return errors.New("invalid role")
	}

	// ✅ Enforce Gmail-only email validation (redundant safety layer)
	if !strings.HasSuffix(strings.ToLower(in.Email), "@gmail.com") {
		return errors.New("only @gmail.com emails are allowed")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	status := "active"
	if roleName == "templeadmin" {
		status = "pending"
	}

	// ✅ Clean phone number (strip +91, non-digits, validate)
	phone, err := cleanPhone(in.Phone)
	if err != nil {
		return err
	}

	user := &User{
		FullName:     in.FullName,
		Email:        in.Email,
		PasswordHash: string(hash),
		RoleID:       role.ID,
		Status:       status,
		Phone:        phone,
	}

	if err := s.repo.Create(user); err != nil {
		return err
	}

	if roleName == "templeadmin" {
		if err := s.repo.CreateApprovalRequest(user.ID, "tenant_approval"); err != nil {
			return errors.New("failed to create approval request")
		}
	}

	return nil
}



// =============================
// Login
// =============================

type LoginInput struct {
	Email    string
	Password string
}

func (s *service) Login(in LoginInput) (*TokenPair, *User, error) {
	user, err := s.repo.FindByEmail(in.Email)
	if err != nil {
		return nil, nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(in.Password)); err != nil {
		return nil, nil, errors.New("invalid credentials")
	}

	switch user.Status {
	case "pending":
		return nil, nil, errors.New("your account is pending approval")
	case "rejected":
		return nil, nil, errors.New("your account was rejected by admin")
	case "inactive":
		return nil, nil, errors.New("your account is inactive")
	}

	if user.EntityID == nil && (user.Role.RoleName == "templeadmin" || user.Role.RoleName == "devotee" || user.Role.RoleName == "volunteer") {
		entityID, err := s.repo.FindEntityIDByUserID(user.ID)
		if err == nil && entityID != nil {
			user.EntityID = entityID
		}
	}

	// Build tokens
	accessToken, err := s.generateAccessToken(user)
	if err != nil {
		return nil, nil, err
	}
	refreshToken, err := s.generateRefreshToken(user)
	if err != nil {
		return nil, nil, err
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, user, nil
}

func (s *service) generateAccessToken(user *User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"role_id": user.RoleID,
		"exp":     time.Now().Add(s.accessTTL).Unix(),
	}
	if user.EntityID != nil {
		claims["entity_id"] = *user.EntityID
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.accessSecret))
}

func (s *service) generateRefreshToken(user *User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"role_id": user.RoleID,
		"exp":     time.Now().Add(s.refreshTTL).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.refreshSecret))
}

// =============================
// Refresh
// =============================

func (s *service) Refresh(refreshToken string) (string, error) {
	token, err := jwt.Parse(refreshToken, func(t *jwt.Token) (interface{}, error) {
		return []byte(s.refreshSecret), nil
	})
	if err != nil || !token.Valid {
		return "", errors.New("invalid refresh token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || claims["user_id"] == nil || claims["role_id"] == nil {
		return "", errors.New("invalid token claims")
	}

	userID := uint(claims["user_id"].(float64))
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return "", errors.New("user not found")
	}

	return s.generateAccessToken(&user)
}

// =============================
// Forgot Password
// =============================

func (s *service) RequestPasswordReset(email string) error {
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		return errors.New("user not found")
	}

	resetToken := generateSecureToken()
	ttl := 15 * time.Minute
	key := fmt.Sprintf("reset_token:%s", resetToken)

	// Store user ID as value
	err = utils.SetToken(key, fmt.Sprint(user.ID), ttl)
	if err != nil {
		return errors.New("could not save reset token")
	}

	// TODO: utils.SendResetLink(user.Email, resetToken)
	// For now, just print the token
	if err := utils.SendResetLink(user.Email, resetToken); err != nil {
	return errors.New("failed to send email")
}


	return nil
}

func (s *service) ResetPassword(token string, newPassword string) error {
	key := fmt.Sprintf("reset_token:%s", token)
	val, err := utils.GetToken(key)
	if err != nil {
		return errors.New("invalid or expired token")
	}

	// Convert userID string back to uint
	var userID uint
	_, err = fmt.Sscan(val, &userID)
	if err != nil {
		return errors.New("invalid token data")
	}

	user, err := s.repo.FindByID(userID)
	if err != nil {
		return errors.New("user not found")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.PasswordHash = string(hash)
	err = s.repo.Update(&user)
if err != nil {
	return errors.New("failed to update password")
}


	_ = utils.DeleteToken(key) // Cleanup token

	return nil
}

// =============================
// Logout
// =============================

func (s *service) Logout() error {
	// JWT is stateless — frontend should just clear token
	return nil
}

// =============================
// Get User By ID
// =============================

func (s *service) GetUserByID(userID uint) (User, error) {
	return s.repo.FindByID(userID)
}

// =============================
// Helpers
// =============================

func generateSecureToken() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func cleanPhone(raw string) (string, error) {
	re := regexp.MustCompile(`\D`)
	cleaned := re.ReplaceAllString(raw, "")

	// Strip leading 91 if present and length is 12
	if len(cleaned) == 12 && strings.HasPrefix(cleaned, "91") {
		cleaned = cleaned[2:]
	}

	if len(cleaned) != 10 {
		return "", errors.New("invalid phone number format")
	}

	return cleaned, nil
}