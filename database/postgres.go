package database

import (
	"fmt"
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/sharath018/temple-management-backend/config"
	"github.com/sharath018/temple-management-backend/internal/auth"
	"github.com/sharath018/temple-management-backend/internal/donation"
	"github.com/sharath018/temple-management-backend/internal/entity"
	"github.com/sharath018/temple-management-backend/internal/event"
	"github.com/sharath018/temple-management-backend/internal/seva"
	"github.com/sharath018/temple-management-backend/internal/notification" // ✅ Add this
)

var DB *gorm.DB

func Connect(cfg *config.Config) *gorm.DB {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort,
	)

	var err error
	for i := 1; i <= 5; i++ {
		DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			log.Println("✅ Connected to database")
			break
		}
		log.Printf("⚠️  DB connection attempt %d/5 failed: %v", i, err)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		log.Fatalf("❌ Could not connect to database: %v", err)
	}

	// ✅ Migrate all required models
	if err := DB.AutoMigrate(
		&auth.UserRole{},
		&auth.User{},
		&auth.ApprovalRequest{},
		&seva.Seva{},
		&seva.SevaBooking{},
		&entity.Entity{},
		&event.Event{},
		&donation.Donation{},
		&notification.NotificationTemplate{}, // ✅ Add this
		&notification.NotificationLog{},      // ✅ Add this
	); err != nil {
		log.Fatalf("❌ AutoMigrate failed: %v", err)
	}

	log.Println("✅ Database schema migrated")

	// 🌱 Call seeder here
	if err := auth.SeedUserRoles(DB); err != nil {
		log.Fatalf("❌ Seeding roles failed: %v", err)
	}

	return DB
}
