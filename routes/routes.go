package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/sharath018/temple-management-backend/config"
	"github.com/sharath018/temple-management-backend/database"
	"github.com/sharath018/temple-management-backend/internal/auth"
	"github.com/sharath018/temple-management-backend/internal/devotee"
	"github.com/sharath018/temple-management-backend/internal/entity"
	"github.com/sharath018/temple-management-backend/internal/event"
	"github.com/sharath018/temple-management-backend/internal/eventrsvp"
	"github.com/sharath018/temple-management-backend/internal/seva"
	"github.com/sharath018/temple-management-backend/internal/superadmin"
	"github.com/sharath018/temple-management-backend/internal/userprofile"
	"github.com/sharath018/temple-management-backend/middleware"
	"github.com/sharath018/temple-management-backend/internal/donation"
	"github.com/sharath018/temple-management-backend/internal/notification"

	_ "github.com/sharath018/temple-management-backend/docs"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func Setup(r *gin.Engine, cfg *config.Config) {
	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "OK"})
	})
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := r.Group("/api/v1")
	api.Use(middleware.RateLimiterMiddleware()) // 🛡 Global rate limit: 5 req/sec per IP

	// ========== Auth ==========
	authRepo := auth.NewRepository(database.DB)
	authSvc := auth.NewService(authRepo, cfg)
	authHandler := auth.NewHandler(authSvc)

	authGroup := api.Group("/auth")
	{
		authGroup.POST("/register", authHandler.Register)
		authGroup.POST("/login", authHandler.Login)
		authGroup.POST("/refresh", authHandler.Refresh)

		// ✅ NEW: Forgot/Reset/Logout
		authGroup.POST("/forgot-password", authHandler.ForgotPassword)
		authGroup.POST("/reset-password", authHandler.ResetPassword)

		// Logout requires Auth Middleware to clear token from Redis
		authGroup.POST("/logout", middleware.AuthMiddleware(cfg, authSvc), authHandler.Logout)
	}

	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware(cfg, authSvc))

	// Dashboards
	protected.GET("/superadmin/dashboard", middleware.RBACMiddleware("superadmin"), func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Super Admin dashboard access granted!"})
	})
	protected.GET("/tenant/dashboard", middleware.RBACMiddleware("templeadmin"), func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Temple Admin dashboard access granted!"})
	})
	protected.GET("/entity/:id/devotee/dashboard", middleware.RBACMiddleware("devotee"), func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Devotee dashboard access granted!"})
	})
	protected.GET("/entity/:id/volunteer/dashboard", middleware.RBACMiddleware("volunteer"), func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Volunteer dashboard access granted!"})
	})

	// ========== Super Admin ==========
	superadminRepo := superadmin.NewRepository(database.DB)
	superadminService := superadmin.NewService(superadminRepo)
	superadminHandler := superadmin.NewHandler(superadminService)

superadminRoutes := protected.Group("/superadmin")
superadminRoutes.Use(middleware.RBACMiddleware("superadmin"))
{
	// 🔁 Paginated list of all tenants with optional ?status=pending&limit=10&page=1
	superadminRoutes.GET("/tenants", superadminHandler.GetTenantsWithFilters)
	superadminRoutes.PATCH("/tenants/:id/approval", superadminHandler.UpdateTenantApprovalStatus)

	// 🔁 Paginated list of entities with optional ?status=pending&limit=10&page=1
	superadminRoutes.GET("/entities", superadminHandler.GetEntitiesWithFilters)
	superadminRoutes.PATCH("/entities/:id/approval", superadminHandler.UpdateEntityApprovalStatus)
}



	// ========== Seva ==========
	sevaRepo := seva.NewRepository(database.DB)
	sevaService := seva.NewService(sevaRepo)
	sevaHandler := seva.NewHandler(sevaService)

	sevaRoutes := protected.Group("/sevas")

	// 🔐 Temple Admin Only
	sevaRoutes.POST("/", middleware.RBACMiddleware("templeadmin"), sevaHandler.CreateSeva)
	sevaRoutes.GET("/entity-bookings", middleware.RBACMiddleware("templeadmin"), sevaHandler.GetEntityBookings)
	sevaRoutes.PATCH("/bookings/:id/status", middleware.RBACMiddleware("templeadmin"), sevaHandler.UpdateBookingStatus)

	// 🔐 Devotee Only
	sevaRoutes.POST("/bookings", middleware.RBACMiddleware("devotee"), sevaHandler.BookSeva)
	sevaRoutes.GET("/my-bookings", middleware.RBACMiddleware("devotee"), sevaHandler.GetMyBookings)
	sevaRoutes.PATCH("/bookings/:id/cancel", middleware.RBACMiddleware("devotee"), sevaHandler.CancelBooking)

	// 🌐 Public or All Authenticated Users
	sevaRoutes.GET("/", sevaHandler.GetSevas) // Exposed to allow entity_id-based querying

	// ========== Entity ==========
	{
		entityRepo := entity.NewRepository(database.DB)
		entityService := entity.NewService(entityRepo)
		entityHandler := entity.NewHandler(entityService)

		entityRoutes := protected.Group("/entities")
		entityRoutes.POST("/", middleware.RBACMiddleware("superadmin", "templeadmin"), entityHandler.CreateEntity)
		entityRoutes.GET("/", middleware.RBACMiddleware("superadmin", "templeadmin"), entityHandler.GetAllEntities)
		entityRoutes.GET("/:id", middleware.RBACMiddleware("superadmin", "templeadmin"), entityHandler.GetEntityByID)
		entityRoutes.PUT("/:id", middleware.RBACMiddleware("superadmin", "templeadmin"), entityHandler.UpdateEntity)
		entityRoutes.DELETE("/:id", middleware.RBACMiddleware("superadmin", "templeadmin"), entityHandler.DeleteEntity)
	}

	// ========== Event & RSVP ==========
	eventRepo := event.NewRepository(database.DB)
	eventService := event.NewService(eventRepo)
	eventHandler := event.NewHandler(eventService)

	{
		eventRoutes := protected.Group("/events")
		eventRoutes.POST("/", middleware.RBACMiddleware("templeadmin"), eventHandler.CreateEvent)
		eventRoutes.GET("/", eventHandler.ListEvents)
		eventRoutes.GET("/upcoming", eventHandler.GetUpcomingEvents)
		eventRoutes.GET("/:id", eventHandler.GetEventByID)
		eventRoutes.PUT("/:id", middleware.RBACMiddleware("templeadmin"), eventHandler.UpdateEvent)
		eventRoutes.DELETE("/:id", middleware.RBACMiddleware("templeadmin"), eventHandler.DeleteEvent)
	}

	{
		rsvpRepo := eventrsvp.NewRepository(database.DB)
		rsvpService := eventrsvp.NewService(rsvpRepo, eventService)
		rsvpHandler := eventrsvp.NewHandler(rsvpService, eventService)

		rsvpRoutes := protected.Group("/event-rsvps")
		rsvpRoutes.POST("/:eventID", middleware.RBACMiddleware("devotee", "volunteer"), rsvpHandler.CreateRSVP)
		rsvpRoutes.GET("/:eventID", middleware.RBACMiddleware("devotee"), rsvpHandler.GetRSVPsByEvent)
		rsvpRoutes.GET("/my", middleware.RBACMiddleware("devotee", "volunteer"), rsvpHandler.GetMyRSVPs)
	}

	// ========== User Profile & Membership ==========
	profileRepo := userprofile.NewRepository(database.DB)
	profileService := userprofile.NewService(profileRepo, authRepo)
	profileHandler := userprofile.NewHandler(profileService)

	profileRoutes := protected.Group("/profiles")
	{
		profileRoutes.GET("/:userID", middleware.RBACMiddleware("devotee"), profileHandler.GetProfile)
		profileRoutes.PUT("/:userID", middleware.RBACMiddleware("devotee"), profileHandler.CreateOrUpdateProfile)
	}

	membershipRoutes := protected.Group("/memberships")
	{
		membershipRoutes.POST("/", middleware.RBACMiddleware("devotee", "volunteer"), profileHandler.JoinTemple)
		membershipRoutes.GET("/", middleware.RBACMiddleware("devotee", "volunteer"), profileHandler.ListMemberships)
	}


	// ========== Donations ==========
{
	donationRepo := donation.NewRepository(database.DB)
	donationService := donation.NewService(donationRepo, cfg)
	donationHandler := donation.NewHandler(donationService)

	donationRoutes := protected.Group("/donations")
	{
		// Devotee: Create & Verify Donation, View My Donations
		donationRoutes.POST("/", middleware.RBACMiddleware("devotee"), donationHandler.CreateDonation)
		donationRoutes.POST("/verify", middleware.RBACMiddleware("devotee"), donationHandler.VerifyDonation)
		donationRoutes.GET("/my", middleware.RBACMiddleware("devotee"), donationHandler.GetMyDonations)

		// Temple Admin: View Donations for their entity
		donationRoutes.GET("/", middleware.RBACMiddleware("templeadmin"), donationHandler.GetDonationsByEntity)
	}
}

// ========== Notifications ========== 
{
	notificationRepo := notification.NewRepository(database.DB)
	notificationService := notification.NewService(notificationRepo, authRepo, cfg)

	notificationHandler := notification.NewHandler(notificationService)

	notificationRoutes := protected.Group("/notifications")
	notificationRoutes.Use(middleware.RBACMiddleware("templeadmin"))

	// 🧩 Templates
	notificationRoutes.POST("/templates", notificationHandler.CreateTemplate)
	notificationRoutes.GET("/templates", notificationHandler.GetTemplates)
	notificationRoutes.GET("/templates/:id", notificationHandler.GetTemplateByID)
	notificationRoutes.PUT("/templates/:id", notificationHandler.UpdateTemplate)
	notificationRoutes.DELETE("/templates/:id", notificationHandler.DeleteTemplate)

	// 📬 Send Notification
	notificationRoutes.POST("/send", notificationHandler.SendNotification)

	// 📜 View Logs
	notificationRoutes.GET("/logs", notificationHandler.GetMyNotifications)
}


// ========== Devotee Portal ==========
	devoteeRepo := devotee.NewRepository(database.DB)
	devoteeService := devotee.NewService(devoteeRepo)
	devoteeHandler := devotee.NewHandler(devoteeService)

	devoteeRoutes := protected.Group("/devotee")
	devoteeRoutes.Use(middleware.RBACMiddleware("devotee"))
	{
		devoteeRoutes.POST("/select-temple", devoteeHandler.SelectTemple)
		devoteeRoutes.GET("/my-temple", devoteeHandler.GetMyTemple)
		devoteeRoutes.GET("/overview", devoteeHandler.GetDevoteeOverview) // ✅ Devotee overview
	}


}
