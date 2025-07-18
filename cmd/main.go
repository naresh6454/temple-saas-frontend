package main

import (
	"fmt"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/sharath018/temple-management-backend/config"
	"github.com/sharath018/temple-management-backend/database"
	"github.com/sharath018/temple-management-backend/internal/auth"
	"github.com/sharath018/temple-management-backend/internal/entity"
	"github.com/sharath018/temple-management-backend/internal/event"
	"github.com/sharath018/temple-management-backend/internal/eventrsvp"
	"github.com/sharath018/temple-management-backend/internal/notification"
	"github.com/sharath018/temple-management-backend/internal/userprofile"
	"github.com/sharath018/temple-management-backend/routes"
	"github.com/sharath018/temple-management-backend/utils"
)

// @title           Temple Management API
// @version         1.0
// @description     API Documentation for Temple Management SaaS Platform
// @termsOfService  http://localhost:5173/terms
// @contact.name    Temple Management Support
// @contact.url     http://localhost:5173
// @contact.email   support@templemgmt.com
// @license.name    MIT
// @license.url     https://opensource.org/licenses/MIT
// @host            localhost:8080
// @BasePath        /api/v1

func main() {
	cfg := config.Load()
	db := database.Connect(cfg)

	// ✅ Init Redis
	if err := utils.InitRedis(); err != nil {
		log.Fatalf("❌ Redis init failed: %v", err)
	}

	// ✅ Init Kafka
	utils.InitializeKafka()

	// ✅ Inject authRepo into notification service
	authRepo := auth.NewRepository(db)
	notificationRepo := notification.NewRepository(db)
	notificationService := notification.NewService(notificationRepo, authRepo, cfg)
	notification.StartKafkaConsumer(notificationService)

	// ✅ Seed roles and super admin
	if err := auth.SeedUserRoles(db); err != nil {
		panic(fmt.Sprintf("❌ Failed to seed roles: %v", err))
	}
	if err := auth.SeedSuperAdminUser(db); err != nil {
		panic(fmt.Sprintf("❌ Failed to seed Super Admin: %v", err))
	}

	// ✅ Auto-migrate models
	if err := db.AutoMigrate(
		&entity.Entity{},
		&event.Event{},
		&eventrsvp.RSVP{},
		&userprofile.DevoteeProfile{},
		&userprofile.UserEntityMembership{},
	); err != nil {
		panic(fmt.Sprintf("❌ DB AutoMigrate failed: %v", err))
	}

	// 🌐 Setup router
	router := gin.Default()

	// ✅ Global CORS config
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Add other frontend URLs if needed
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization", "X-Tenant-ID", "x-tenant-id"},
		ExposeHeaders:    []string{"Content-Length", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// ✅ Register all routes
	routes.Setup(router, cfg)

	// 🚀 Run server
	fmt.Printf("🚀 Server starting on port %s\n", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		panic(fmt.Sprintf("Failed to start server: %v", err))
	}
}