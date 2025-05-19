package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

var (
	portNo = 8300
)

func ping(c *gin.Context) {
	obj := map[string]string{"message": "pong"}
	c.JSON(200, obj)
}

func initRoutes(router *gin.Engine) {
	router.GET("/ping", ping)
	router.GET("/api/users", userAPI)
}

func main() {
	// init router
	router := gin.Default()

	// initialize routes
	initRoutes(router)

	// run router
	router.Run(fmt.Sprintf("0.0.0.0:%d", portNo))
}

func addErrorResp(c *gin.Context, code int, obj any) {
	c.JSON(code, map[string]any{"error": obj})
}

func addApiResp(c *gin.Context, code int, obj any) {
	c.JSON(code, map[string]any{"data": obj})
}
