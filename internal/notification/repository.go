package notification

import (
	"context"
	"errors"

	"gorm.io/gorm"
)

type Repository interface {
	// Templates
	CreateTemplate(ctx context.Context, template *NotificationTemplate) error
	GetTemplateByID(ctx context.Context, id uint, entityID uint) (*NotificationTemplate, error)
	GetTemplatesByEntity(ctx context.Context, entityID uint) ([]NotificationTemplate, error)
	UpdateTemplate(ctx context.Context, template *NotificationTemplate) error
	DeleteTemplate(ctx context.Context, id uint, entityID uint) error

	// Logs
	CreateNotificationLog(ctx context.Context, log *NotificationLog) error
	UpdateNotificationLog(ctx context.Context, log *NotificationLog) error
	GetNotificationsByUser(ctx context.Context, userID uint) ([]NotificationLog, error)
	MarkNotificationAsRead(ctx context.Context, notificationID uint, userID uint) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

// ------------------------------
// Templates
// ------------------------------

func (r *repository) CreateTemplate(ctx context.Context, template *NotificationTemplate) error {
	return r.db.WithContext(ctx).Create(template).Error
}

func (r *repository) GetTemplateByID(ctx context.Context, id uint, entityID uint) (*NotificationTemplate, error) {
	var t NotificationTemplate
	err := r.db.WithContext(ctx).
		Where("id = ? AND entity_id = ?", id, entityID).
		First(&t).Error
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *repository) GetTemplatesByEntity(ctx context.Context, entityID uint) ([]NotificationTemplate, error) {
	var templates []NotificationTemplate
	err := r.db.WithContext(ctx).
		Where("entity_id = ?", entityID).
		Order("created_at DESC").
		Find(&templates).Error
	return templates, err
}

func (r *repository) UpdateTemplate(ctx context.Context, template *NotificationTemplate) error {
	return r.db.WithContext(ctx).
		Model(&NotificationTemplate{}).
		Where("id = ? AND entity_id = ?", template.ID, template.EntityID).
		Updates(template).Error
}

func (r *repository) DeleteTemplate(ctx context.Context, id uint, entityID uint) error {
	res := r.db.WithContext(ctx).
		Where("id = ? AND entity_id = ?", id, entityID).
		Delete(&NotificationTemplate{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return errors.New("template not found or unauthorized")
	}
	return nil
}

// ------------------------------
// Logs
// ------------------------------

func (r *repository) CreateNotificationLog(ctx context.Context, log *NotificationLog) error {
	return r.db.WithContext(ctx).Create(log).Error
}

func (r *repository) UpdateNotificationLog(ctx context.Context, log *NotificationLog) error {
	return r.db.WithContext(ctx).
		Model(&NotificationLog{}).
		Where("id = ?", log.ID).
		Updates(log).Error
}

func (r *repository) GetNotificationsByUser(ctx context.Context, userID uint) ([]NotificationLog, error) {
	var logs []NotificationLog
	err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&logs).Error
	return logs, err
}

func (r *repository) MarkNotificationAsRead(ctx context.Context, notificationID uint, userID uint) error {
	return r.db.WithContext(ctx).
		Model(&NotificationLog{}).
		Where("id = ? AND user_id = ?", notificationID, userID).
		Update("is_read", true).Error
}
