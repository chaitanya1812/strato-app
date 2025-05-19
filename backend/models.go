package main

import "time"

type User struct {
	HumanUser               string
	CreateDate              time.Time
	PasswordChangedDate     time.Time
	DaysSincePasswordChange int
	LastAccessDate          time.Time
	DaysSinceLastAccess     int
	MFAEnabled              bool
}
