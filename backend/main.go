package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
)

var(
	portNo = 8300
)


func ping(c *gin.Context){
	obj := map[string]string{"message": "pong"}
	c.JSON(200, obj)
}

func userAPI(c *gin.Context){
	obj := map[string]string{"message": "users api"}
	c.JSON(200, obj)
}

func main(){
	router := gin.Default()
	router.GET("/ping", ping)
	router.GET("/api/users", userAPI)
	router.Run(fmt.Sprintf("localhost:%d",portNo))
}