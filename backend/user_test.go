package main

import (
	"os"
	"testing"
	"time"
)


func TestReadData(t *testing.T) {
	
	csvContent := `username,create_date,password_change_date,days_since_password_change,last_access_date,days_since_last_access,mfa_enabled
u1,Jan 1 2024,May 24 2025,0,May 25 2025,0,yes
u2,Feb 2 2023,Feb 10 2024,0,May 10 2025,0,no
`

	// Create a temporary file and write the CSV content
	tmpfile, err := os.CreateTemp("", "user_data_*.csv")
	if err != nil {
		t.Fatalf("unable to create temp file: %v", err)
	}
	defer os.Remove(tmpfile.Name())
	if _, err := tmpfile.Write([]byte(csvContent)); err != nil {
		t.Fatalf("unable to write to temp file: %v", err)
	}
	tmpfile.Close()

	// Set the global filePath to the temp file's path
	filePath = tmpfile.Name()

	now := time.Now().UTC()

	// Call 
	users, err := readData()
	if err != nil {
		t.Fatalf("readData failed: %v", err)
	}

	// Assert number of rows
	if len(users) != 2 {
		t.Errorf("expected 2 users, got %d", len(users))
	}

	
	user1 := users[0]
	wantPwdDays := int(now.Sub(time.Date(2025, 5, 24, 0, 0, 0, 0, time.UTC)).Hours() / 24)
	wantAccessDays := int(now.Sub(time.Date(2025, 5, 25, 0, 0, 0, 0, time.UTC)).Hours() / 24)
	if user1.DaysSincePasswordChange != wantPwdDays {
		t.Errorf("user1.DaysSincePasswordChange: got %d, want %d", user1.DaysSincePasswordChange, wantPwdDays)
	}
	if user1.DaysSinceLastAccess != wantAccessDays {
		t.Errorf("user1.DaysSinceLastAccess: got %d, want %d", user1.DaysSinceLastAccess, wantAccessDays)
	}
	if !user1.MFAEnabled {
		t.Errorf("user1.MFAEnabled: got false, want true")
	}
}
