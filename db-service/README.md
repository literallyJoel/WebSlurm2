# WebSlurm 2 Database Service

This is the database service for WebSlurm 2, an easy-to-use web interface for running tasks on High Performance Computing (HPC) clusters using the Slurm command line tool. The database service handles all database operations for the WebSlurm 2 project.

This project is a work in progress.

## Important Info

This project is a work in progress and has not yet been fully tested.
Whilst in theory the database types listed below are supported, it has only been tested with SQLite so far. Further testing with the other supported types will done in due course.

## Overview

The database service provides a flexible and extensible API for database operations, supporting multiple database types including SQLite, PostgreSQL, SQL Server, and Oracle. It uses Knex.js as the query builder and ORM. MySQL is not supported due to its lack of support for the "returning" function in knex.

## Requirements

This project requires the [Bun](https://bun.sh/) JavaScript runtime, and is tested with Bun v 1.1.12.

This project has been tested on Node.js v22.2.0, though other versions may work.

## Features

- Support for multiple database types (SQLite, PostgreSQL, SQL Server, Oracle)

- RESTful API for database operations

- Modular architecture with easy-to-extend models

- Transaction support for complex operations

- Error handling and logging

- Runtime configuration

## Setup

1. Install dependencies:
   ```bash
   bun  install
   ```
2. Set up environment variables:

- `DB_SERVICE_PORT`: Port for the database service (default: 5160)

- `DATABASE_TYPE`: Type of database (sqlite, postgres, sqlserver, oracledb)

- `DATABASE_CONNECTION_STRING`: Connection string for the database, or filepath for SQLite

3. Start the service:
   ```bash
   bun start
   ```

## API Endpoints

### Service Configuration

- `POST /service-config/init`: Initialize database configuration

- `GET /service-config/status`: Get service status

- `GET /service-config/config`: Get current database configuration

- `GET /service-config/type`: Get database type

### Database Operations

- `GET /ping`: Check if the service is running

- `POST /query`: Perform a single database operation

- `POST /transaction`: Perform multiple database operations in a transaction

## Models

The service includes the following models:

- User

- Organisation

- OrganisationMember

- Config

Each model extends the `ModelClass`, which provides common CRUD operations.

## Usage

### Single Query

To perform a single database operation:

```javascript

POST  /query

{

"model": "user",

"operation": "getOne",

"params": {  "id":  "123"  }

}
```

### Transaction

To perform multiple database operations in a transaction:

```javascript

POST  /transaction

{

"operations": [

   {

   "order":  1,

   "model":  "user",

   "operation":  "create",

   "params":  {  "name":  "John Doe",  "email":  "john@example.com"  },

   "resultKey":  "user",
   "return": ["id", "email"]

   },

   {

   "order":  2,

   "model":  "organisation",

   "operation":  "create",

   "params":  {  "name":  "ACME Inc." },

   "return": ["id"]

   },
   {
      "order": 3,
      "model": "organisationMember",
      "operation": "create",
      "params": {
      "organisationId": { "$ref": "organisation", "field": "id" },
      "userId": { "$ref": "user", "field": "id" },
      "role": "user"
      },
      "return": ["role"]
   }

   ]

}
```

The `return` field is optional, and if provided, it should be an array of strings, each representing a field in the result object. The result object witll be returned as a JSON object, with each model being a property on the object, containing an array of objects, where each object contains the return results.

An example of the result object for the above transaction is:

```json
{
  "user": [
    {
      "id": "123",
      "email": "john@example.com"
    }
  ],
  "organisation": [
    {
      "id": "456",
      "name": "ACME Inc."
    }
  ],
  "organisationMember": [
    {
      "role": "user"
    }
  ]
}
```

### Creating new Models

To add a new model

1. Create a new file in the `models` directory, e.g. `models/newModel.ts`

2. Extend the `ModelClass` class and implement the required methods

3. Add the new model to the `MODELS` array in `service-config/schema.ts`

The required methods are:

```javascript
//Returns the keys to use for the query, e.g. for a user model, this would be `{ id: identifier.id }`
getKeys(identifier: Partial<T>): Partial<T>
```

```javascript
//Sanitises the data returned from the database, e.g. for the user model, we remove the password field from the returned data.
sanitiseData(data: T): SanitisedT;

sanitiseData(data: T[]): SanitisedT[];

sanitiseData(data: undefined): undefined;

sanitiseData(data: T  |  T[] |  undefined): SanitisedT  |  SanitisedT[] |  undefined;

```

### Error Handling

The service uses a centralized error handling mechanism ('/helpers/errorHandling.ts'). Errors are categorized and appropriate HTTP status codes are returned.

The error types are:

- `NOT_FOUND`: 404

- `ALREADY_EXISTS`: 409

- `BAD_REQUEST`: 400

- `UNAUTHORIZED`: 401

- `FORBIDDEN`: 403

- `INTERNAL_SERVER_ERROR`: 500

Errors can be passed to the `handleError` function to return a formatted response. The `handleError` function takes the error object, and optionally one of the above error types, and returns a formatted response object, using INTERNAL_SERVER_ERROR as the default error type.

### Dependencies

The service uses the following dependencies:

- `elysia`: ^1.0.27

- `knex`: ^3.1.0

- `oracledb`: ^6.5.1

- `pg`: ^8.12.0

- `sqlite3`: ^5.1.7

- `tedious`: ^18.2.3

- `uuid`: ^10.0.0
