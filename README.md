# strato-app
Fetch Users data from a Golang API and display in Frontend React App.

## how to run
- Make sure docker daemon is up and running. Run the following command to build and start the application.

    `docker compose up --build`

> **Note:** The port numbers used for the application to run on host machine are `3000` for frontend and `8300` for backend. If you see any errors like "port in use" for frontend or backend, update the host machine port mapping in the  [`docker-compose.yml`](docker-compose.yml) file with the unused port in you host machine. 

- Now visit `localhost:3000` / `localhost:<forntend-port>` to open the app.

> note: ensure the proxy is configured in [package.json](frontend/package.json) as `"proxy": "http://backend:<backend-port>"`.


## how to run without using docker (ignore if you are using docker):
- Make sure Golang and React JS setup is properly configured.

- First let's run the backend go server. Go to the new terminal and run the following commande from the project root.
    ```bash
    cd backend && go run .
    ```
> note: ensure the proxy is configured in [package.json](frontend/package.json) as `"proxy": "http://0.0.0.0:<backend-port>"`.

- Now, let's run the frontend. Go to the new terminal and run the following commande from the project root.
    ```bash
    cd frontend && npm start
    ```
> note: in case of issues with the port numbers, update the port number [main.go](backend/main.go) for backend and for frontend configure it by adding a `.env` file in `~/frontend/` folder and setting `PORT=<port-no>` in the .env file.

- Now visit `localhost:3000` / `localhost:<forntend-port>` to open the app.



## Docker compose and Docker file details:
- Two services, named `frontend` and `backend` are configured to handle the `frontend` application and `backend` application respectively. 
- Backend Service:
    - A new docker container is created based on the backend docker file [Dockerfile.backend](Dockerfile.backend)
    - The container is created using the Golang base image, backend code is copied to the container and all the dependencies are dowloaded. The container is setup to run the backend code.
    - The startup command for backend is `go run .` which means to run the go code in `~/backend/` folder. The Go server listens at port `8300` inside the container and the port number is configured in the code. `~/backend/main.go`
    - the localhost's `8300` port is mapped to container's `8300` port so that the server which is running in docker can be accessed from the host machine.

- Frontend Service:
    - A new docker container is created based on the frontend docker file [Dockerfile.frontend](Dockerfile.frontend)
    - The container is created using the node base image, frontend code is copied to the container and all the dependencies are dowloaded. The container is setup to run the frontend react app.
    - The startup command for frontend is `npm start` which means to run the react app in `~/frontend/` folder. The frontend server listens at port `3000`(default port number by react app). This can be configured by adding a `.env` file in `~/frontend/` folder and setting `PORT=<port-no>` in the file.
    - the localhost's `3000` port is mapped to container's `3000` port so that the frontend server which is running in docker can be accessed from the host machine.
    - `depends_on: backend` in docker-compose suggests that the the frontend service depends on backend server and docker follows the startup and shutdown order based on this; i.e, starts backend first and stops frontend first.


# Design:

## Overview:
- The Backend server is in Golang. An API is exposed to respond with user details from the csv file with necessary live computed values. 
- The Frontend react app consumes the API and displays the data in tabular format with different filters and highlighting options. 

## Backend Architechture and Flow:
- The backend server is developed using Golang. 
- A library Gin - HTTP web framework is used to build the backend HTTP server. 
- Multiple routes (`/ping`, `/api/users`)are configured to the Gin Engine. Method invocation configurations happens here. (i.e, which method needs to be called on the incoming API request)
- The server starts running and listens at the specified port number.
- Now on a specific API request, corresponding method is called and API request is served.
- The `/ping` api reponds with a pong message, just used to check is server is up and running.
- The main users API `/api/users` calls `handleUsersAPI` to process the api request.
- The API loads the data from the static [csv file](backend/user_data.csv) present in the `~/backend/` folder.
- It reads the rows one by one; parses, formats and computes the fields as required.
- computes `daysSincePasswordChange` by checking the time difference between current time and `passwordChangeDate`. 
- computes `daysSinceLastAccess` by checking the time difference between current time and `lastAccessDate`. 
- Build the user object for each row. Users object is declared in [models.go](backend/models.go)
- The API finally retuns the array of user objects. 
- The API prints error and ignores the rows in case of any errors in a spicific row. In case of error while reading file the error object is returned.
- All the API responses without error, the response object is wrapped and can be accessed with `data` key. In case of error, the error object wrapped and can be accessed with `error` key. The reponse objects are attached with proper HTTP status code. for eg: `200` in case of correct reponse, `500` in case of any internal server error.
- unit test file is added at [user_test.go](backend/user_test.go) to test the reading data from csv file.

## Backend APIs

- `GET` `/ping`:
    - The ping API is used to just check the health of the server.
    - API response:
        ```json
        {
            "data": {
                "message": "pong"
            }
        }
        ```
- `GET` `/api/users`:
    - The main API to get the user details.
    - Sample API response
        ```json
            {
                "data": [
                    {
                        "human_user": "Foo Bar1",
                        "create_date": "2020-10-01T00:00:00Z",
                        "password_changed_date": "2021-10-01T00:00:00Z",
                        "days_since_password_change": 1329,
                        "last_access_date": "2025-01-04T00:00:00Z",
                        "days_since_last_access": 138,
                        "mfa_enabled": true
                    },
                    {
                        "human_user": "Foo1 Bar1",
                        "create_date": "2019-09-20T00:00:00Z",
                        "password_changed_date": "2019-09-22T00:00:00Z",
                        "days_since_password_change": 2069,
                        "last_access_date": "2025-02-08T00:00:00Z",
                        "days_since_last_access": 103,
                        "mfa_enabled": false
                    },
                    // ... 
                ]
            }
        ```
- In case of error:
    - the error object wrapped and can be accessed with `error` key
    - ```json
        {
            "error": "<error>"
        }
      ```
- API response Without error:
    - the response object wrapped and can be accessed with `data` key
    - ```json
        {
            "data": "<response-object>"
        }
      ```

## limitations and tradoffs:
- The file with users data is expected to be in csv format.
- The file with users data  is expected to be in the `~/backend/` folder with name `user_data.csv` [csv file](backend/user_data.csv). or update the file_path in code [user.go](backend/user.go) accordingly.
- Regarding the time difference calculation: The time stamps in csv file are considered as UTC 0hrs:0mins time stamp and the difference is calculated based on current UTC time. Additionally, the days do not round, but truncate towards zero. This means that if there is any partial day (even a second), it will not be counted as a full day.

# Frontend 
- ReactJs is used to develop the frontend. 
- The proxy is configured in [package.json](frontend/package.json) as `"proxy": "http://<backend-host>:<backend-port>"` to be able to connect to the backend.
- `@tanstack/react-table` library is used to display the table.
- An api call (`/api/users`) is made to the backend to fetch the data. `fetch('/api/users')`
- The data is formatted as needed; for eg, the date string formatting, MFA Enabled format, etc.
- `useMemo` react hook is used to configure/memoize the column definitions - custom column/header names, custom filters.
- The table data and configuration is build using the data, from the api, columns from the memo, and default filters in custome filters are not specified in the memo.
- The default filter is `includesString`(string matching) for all the columns except `Days Since Password Change` and `Days Since Last Access`. For these two columns the custom filter is configured in memo `filterFn` feature. The custom filter is `greaterThanNumber` which converts the data value and input values to numbers and returns true for the rows when the data value is greater than the input filter value - thus works as a filter to filter out the rows having data values greater than the input filter value.
- `getCoreRowModel()`, `getFilteredRowModel()` row models are used for row and filtered rows.
- The table has a header with column names and then a row with filter input boxes to take filter input value. Filters can be applied on multiple columns at a time. A `x` button pops up next to the input box to clear the particular column filter. 
- Note: for `Days Since Password Change` and `Days Since Last Access` columns the filter is GreaterThan filter and for all other columns it is string matching filter.
- Additionally there is a table summary which shows the number rows currently displayed.
- Also there are few row highlighting options provided in the top right corner - to highlight the the Password stale users (based on `Days Since Password Change`) and Inactive users (based on `Days Since Last Access`) - The rows with data value greater than the entered input value are highlighted. These highlight options won't filter out other rows, but just highlights the correponding rows as per the highlight options selected.
- `highlightStalePasswords`, `highlightInactiveUsers` methods are called when the corresponding highlight buttons are clicked. when these methods are invoked, they set the highlighted rows based on the entered input value and the rows are highlighted in `lightyellow` color.
- Note: to properly use highlights, first apply the colum filters if needed, then use the highlight options.
- There is an option to `Clear Highlights` which clears the current highlights on the rows and also an option to `Clear All Filters and Highlights` to clear all the current filters and highlights.
- The css styling is declared in css file and inline as needed.

