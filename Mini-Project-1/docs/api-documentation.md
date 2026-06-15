# REST API Documentation (Mini-Project-1)

The backend provides a RESTful API to manage student records. All request and response bodies use the `application/json` format.

---

## 1. Health Check
Checks if the backend server is running and database communication is operational.

* **URL**: `/api/health`
* **Method**: `GET`
* **Response (200 OK)**:
  ```json
  {
    "status": "healthy",
    "message": "Backend service is running."
  }
  ```

---

## 2. Get All Students
Retrieves all student records, ordered by creation date descending. Supports filtering by a search term.

* **URL**: `/api/students`
* **Method**: `GET`
* **URL Params (Optional)**:
  - `search` (string): Filters students by name, email, phone, or course using case-insensitive partial match (`ILIKE`).
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "id": 2,
        "name": "Diya Sharma",
        "email": "diya.sharma@example.com",
        "phone": "+91 98765 43211",
        "course": "Data Science",
        "created_at": "2026-06-15T10:00:00.000Z"
      },
      {
        "id": 1,
        "name": "Aarav Mehta",
        "email": "aarav.mehta@example.com",
        "phone": "+91 98765 43210",
        "course": "Computer Science",
        "created_at": "2026-06-15T09:45:00.000Z"
      }
    ]
  }
  ```

---

## 3. Get Student by ID
Retrieves details of a single student.

* **URL**: `/api/students/:id`
* **Method**: `GET`
* **Path Params**:
  - `id` (integer): The unique ID of the student.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Aarav Mehta",
      "email": "aarav.mehta@example.com",
      "phone": "+91 98765 43210",
      "course": "Computer Science",
      "created_at": "2026-06-15T09:45:00.000Z"
    }
  }
  ```
* **Error Responses**:
  - **400 Bad Request**: Provided ID is not an integer.
  - **404 Not Found**: No student exists with that ID.

---

## 4. Create Student
Adds a new student to the registry.

* **URL**: `/api/students`
* **Method**: `POST`
* **Body Requirements**:
  ```json
  {
    "name": "Kabir Patel",
    "email": "kabir.patel@example.com",
    "phone": "+91 98765 43212",
    "course": "Artificial Intelligence"
  }
  ```
* **Success Response (210 Created)**:
  ```json
  {
    "success": true,
    "message": "Student added successfully!",
    "data": {
      "id": 3,
      "name": "Kabir Patel",
      "email": "kabir.patel@example.com",
      "phone": "+91 98765 43212",
      "course": "Artificial Intelligence",
      "created_at": "2026-06-15T10:15:00.000Z"
    }
  }
  ```
* **Error Responses**:
  - **400 Bad Request**: Missing required field(s), invalid email syntax, or invalid telephone number.
  - **409 Conflict**: Email is already registered.

---

## 5. Update Student
Modifies details of an existing student.

* **URL**: `/api/students/:id`
* **Method**: `PUT`
* **Path Params**:
  - `id` (integer): Student ID.
* **Body Requirements**:
  ```json
  {
    "name": "Kabir Patel",
    "email": "kabir.updated@example.com",
    "phone": "+91 98765 43299",
    "course": "Robotics Engineering"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Student updated successfully!",
    "data": {
      "id": 3,
      "name": "Kabir Patel",
      "email": "kabir.updated@example.com",
      "phone": "+91 98765 43299",
      "course": "Robotics Engineering",
      "created_at": "2026-06-15T10:15:00.000Z"
    }
  }
  ```
* **Error Responses**:
  - **400 Bad Request**: Invalid inputs or format.
  - **404 Not Found**: Student record not found.
  - **409 Conflict**: Updated email address is already taken by another student.

---

## 6. Delete Student
Permanently removes a student record from the database.

* **URL**: `/api/students/:id`
* **Method**: `DELETE`
* **Path Params**:
  - `id` (integer): Student ID.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Student record deleted successfully!",
    "data": {
      "id": 3,
      "name": "Kabir Patel",
      "email": "kabir.updated@example.com",
      "phone": "+91 98765 43299",
      "course": "Robotics Engineering",
      "created_at": "2026-06-15T10:15:00.000Z"
    }
  }
  ```
* **Error Responses**:
  - **400 Bad Request**: Invalid ID format.
  - **404 Not Found**: Student record not found.
