# ft_transcendence

## WIKI PROJECT
https://github.com/albertpardo/ft_transcendence/wiki

## TASK PLANNER
https://github.com/users/albertpardo/projects/1/views/1

## TO TEST API

GO API HOME
```
http://127.0.0.1:4000
```

GET ALL USERS
```
http://127.0.0.1:4000/users
```

GET USER BY ID
```
http://127.0.0.1:4000/users/id/2
```

GET USER BY NAME
```
http://127.0.0.1:4000/users/name/Carlos
```

>NOTE: TO TEST THE POST, PUT & DELETE METHODS, YOU CAN USE POSTMAN, INSOMNIA OR DIRECTLY WITH THE DATABASE.

CREATE USER (POST METHOD)
```
http://127.0.0.1:4000/users

#SINTAXIS
{
    "name" : "Claudia",
    "email" : "claudia@example.com"
}
```

EDIT A USER (PUT METHOD)
```
http://127.0.0.1:4000/users/id/3

#SINTAXIS
{
    "name" : "Claudia",
    "email" : "new-email@example.com"
}
```

DELETE A USER (DELETE METHOD)
```
http://127.0.0.1:4000/users/id/5
```
