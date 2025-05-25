package main

import (
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// file path of the users csv file
var filePath = "user_data.csv"

func handleUsersAPI(c *gin.Context) {
	users, err := readData()
	// return error response in case of any error
	if err != nil {
		addErrorResp(c, 500, "unable to get user data : "+err.Error())
		return
	}
	// return API reponse
	addApiResp(c, 200, users)
}

func readData() ([]User, error) {
	// open the file
	f, err := os.Open(filePath)

	if err != nil {
		return nil, errors.New("unable open file")
	}
	// close when done
	defer f.Close()
	// get new reader
	csvReader := csv.NewReader(f)
	
	// read and ignore the header
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
		// parse fields

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
		now := time.Now().UTC()

		// compute daysSincePasswordChange take time difference in hrs and divide by 24 to get #days
		daysSincePasswordChange := int(now.Sub(passwordChangeDate).Hours() / 24)
		
		// compute daysSinceLastAccess take time difference in hrs and divide by 24 to get #days
		daysSinceLastAccess := int(now.Sub(lastAccessDate).Hours() / 24)

		// convert to bool, can be formated in frontend as needed.
		mfaEnabled := (strings.ToLower(userRow[6]) == "yes")

		// build and append current user object
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
	// return users array
	return users, nil
}

// parseDate parse the date from file format to golang time.Time format
func parseDate(dateStr string) (time.Time, error) {
	layout := "Jan 2 2006"
	return time.Parse(layout, dateStr)
}
