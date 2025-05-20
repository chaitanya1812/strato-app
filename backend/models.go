package main

import "time"

type User struct {
    HumanUser               string    `json:"human_user"`
    CreateDate              time.Time `json:"create_date"`
    PasswordChangedDate     time.Time `json:"password_changed_date"`
    DaysSincePasswordChange int       `json:"days_since_password_change"`
    LastAccessDate          time.Time `json:"last_access_date"`
    DaysSinceLastAccess     int       `json:"days_since_last_access"`
    MFAEnabled              bool      `json:"mfa_enabled"`
}