package main

import (
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

var filePath = "user_data.csv"

func userAPI(c *gin.Context) {
	users, err := readData()
	if err != nil {
		addErrorResp(c, 500, "unable to get user data : "+err.Error())
		return
	}
	addApiResp(c, 200, users)
}

func readData() ([]User, error) {
	f, err := os.Open(filePath)

	if err != nil {
		return nil, errors.New("unable open file")
	}

	defer f.Close()

	csvReader := csv.NewReader(f)
	// csvReader.FieldsPerRecord = 7
	_, err = csvReader.Read()
	if err != nil {
		return nil, fmt.Errorf("unable to read the file header : %s", err.Error())
	}

	var users []User
	for {
		userRow, err := csvReader.Read()

		// break when done
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("unable to read the file row : %s", err.Error())
		}

		// type User struct {
		// 	HumanUser               string
		// 	CreateDate              time.Time
		// 	PasswordChangedDate     time.Time
		// 	DaysSincePasswordChange int
		// 	LastAccessDate          time.Time
		// 	DaysSinceLastAccess     int
		// 	MFAEnabled              bool
		// }

		createDate, err := parseDate(userRow[1])
		if err != nil {
			fmt.Printf("unable to parse create date : %s", err.Error())
			continue
		}

		passwordChangeDate, err := parseDate(userRow[2])
		if err != nil {
			fmt.Printf("unable to parse password change date : %s", err.Error())
			continue
		}

		lastAccessDate, err := parseDate(userRow[4])
		if err != nil {
			fmt.Printf("unable to parse last access date : %s", err.Error())
			continue
		}

		daysSincePasswordChange, err := strconv.Atoi(userRow[3])
		if err != nil {
			fmt.Printf("unable to parse days since password change : %s", err.Error())
			continue
		}
		daysSinceLastAccess, err := strconv.Atoi(userRow[5])
		if err != nil {
			fmt.Printf("unable to parse days since last access : %s", err.Error())
			continue
		}

		
		mfaEnabled := (strings.ToLower(userRow[6]) == "yes")

		users = append(users, User{
			HumanUser:               userRow[0],
			CreateDate:              createDate,
			PasswordChangedDate:     passwordChangeDate,
			DaysSincePasswordChange: daysSincePasswordChange,
			LastAccessDate:          lastAccessDate,
			DaysSinceLastAccess:     daysSinceLastAccess,
			MFAEnabled:              mfaEnabled,
		})

	}
	return users, nil
}

func parseDate(dateStr string) (time.Time, error) {
	layout := "Jan 2 2006"
	return time.Parse(layout, dateStr)
}
