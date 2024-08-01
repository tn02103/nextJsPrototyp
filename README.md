This is a prototype Project to show how to savely implement NextJs 14 in your next Project. 

## Getting Started
### Enviroment
create a .env file with the following variables:
```
DATABASE_URL=URL of the actual database for this Project. 
DATABASE_SHADOW_URL=URl of a shadow database that is used for prisma development migrations not required
```

run the following commands to initialize the Project:
```

```

### Starting the Project
To start Development Server run 
```
npm run dev
```

To start the Production Server run
```
npm run build
npm run start
```

### Initialize the database
To Initialize the database follow these steps:
1) Create a new empty Database with a user that has the role for DQL, DML, DDL Queries.
2) If enviroment is a development enviroment seccond shadow databse should be created.
3) Add the enviroment variables for the database in the following form 
```DATABASE_URL="postgresql://username:password@host:port/database"```
4) Run ```npx prisma migrate dev``` 
